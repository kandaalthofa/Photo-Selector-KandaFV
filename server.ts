import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper: Extract folder ID from various Google Drive folder URL formats
function extractFolderId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Folder URL patterns:
  // https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I...
  // https://drive.google.com/drive/u/0/folders/1A2b3C4d5E6f7G8h9I...
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (folderMatch) return folderMatch[1];

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idParamMatch && trimmed.includes('folder')) return idParamMatch[1];

  // Raw ID check (typically 25-40 chars)
  if (/^[a-zA-Z0-9_-]{18,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

// Helper: Extract individual Google Drive file IDs and filenames from raw text or URLs
function extractFileIdsFromText(text: string): Array<{ id: string; filename?: string }> {
  const lines = text.split('\n');
  const results: Array<{ id: string; filename?: string }> = [];
  const seenIds = new Set<string>();

  // Match pattern for file ID:
  // /file/d/FILE_ID
  // id=FILE_ID
  // /open?id=FILE_ID
  // googleusercontent.com/d/FILE_ID
  const fileIdRegex = /(?:\/file\/d\/|open\?id=|thumbnail\?id=|\/d\/|id=)([a-zA-Z0-9_-]{20,50})/g;

  for (const line of lines) {
    let match;
    let foundInLine = false;

    // Check if line contains a filename indicator (e.g., "photo_01.jpg - http://...")
    const filenameMatch = line.match(/([a-zA-Z0-9_\-.\s]+\.(?:jpg|jpeg|png|webp|heic|gif|svg|bmp|tiff|raw|dng))\b/i);
    const lineFilename = filenameMatch ? filenameMatch[1].trim() : undefined;

    while ((match = fileIdRegex.exec(line)) !== null) {
      const id = match[1];
      // Filter out 'folders' or invalid IDs
      if (id && !id.includes('folder') && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id,
          filename: lineFilename
        });
        foundInLine = true;
      }
    }

    if (!foundInLine) {
      // Try fallback for bare file ID on its own line
      const lineTrim = line.trim();
      if (/^[a-zA-Z0-9_-]{25,45}$/.test(lineTrim) && !seenIds.has(lineTrim)) {
        seenIds.add(lineTrim);
        results.push({ id: lineTrim, filename: lineFilename });
      }
    }
  }

  return results;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Proxy Image endpoint to bypass CORS / Referrer restrictions for Google Drive thumbnails
app.get("/api/proxy-image", async (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId) {
    return res.status(400).send("Missing file id");
  }

  try {
    const driveThumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    const response = await fetch(driveThumbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      // Try secondary endpoint
      const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}=s800`;
      const fallbackRes = await fetch(lh3Url);
      if (fallbackRes.ok) {
        const buffer = await fallbackRes.arrayBuffer();
        res.setHeader('Content-Type', fallbackRes.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(Buffer.from(buffer));
      }
      return res.status(404).send("Image not found");
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Proxy image error:", error);
    return res.status(500).send("Failed to load image");
  }
});

// Parse Google Drive Folder
app.post("/api/parse-drive-folder", async (req, res) => {
  try {
    const { urlOrId } = req.body;
    if (!urlOrId) {
      return res.status(400).json({ success: false, error: "Link atau ID Folder Google Drive wajib diisi." });
    }

    const folderId = extractFolderId(urlOrId);
    if (!folderId) {
      return res.status(400).json({ 
        success: false, 
        error: "Link folder Google Drive tidak valid. Pastikan format link seperti: https://drive.google.com/drive/folders/ID_FOLDER" 
      });
    }

    // Try fetching embedded folderview from Google Drive
    const embeddedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
    const response = await fetch(embeddedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
      }
    });

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: "Folder tidak dapat diakses publik. Pastikan pengaturan berbagi (sharing) folder diset ke 'Siapa saja yang memiliki link'."
      });
    }

    const html = await response.text();
    const files: Array<{
      id: string;
      name: string;
      mimeType: string;
      thumbnailUrl: string;
      directUrl: string;
      driveUrl: string;
      size?: string;
      selected: boolean;
      dimensions?: string;
    }> = [];

    // Parse files from embedded HTML
    // Entries in embedded folderview script/HTML:
    // e.g., class="flip-entry" id="entry-FILE_ID" ... title="FILENAME"
    const entryRegex = /id="entry-([a-zA-Z0-9_-]{20,50})"[^>]*>[\s\S]*?class="flip-entry-title"[^>]*>([^<]+)</g;
    let match;
    const seenIds = new Set<string>();

    while ((match = entryRegex.exec(html)) !== null) {
      const id = match[1];
      const name = match[2]?.trim() || `Photo_${files.length + 1}.jpg`;

      if (!seenIds.has(id)) {
        seenIds.add(id);
        files.push({
          id,
          name,
          mimeType: name.endsWith('.png') ? 'image/png' : 'image/jpeg',
          thumbnailUrl: `/api/proxy-image?id=${id}`,
          directUrl: `https://drive.google.com/uc?id=${id}&export=download`,
          driveUrl: `https://drive.google.com/file/d/${id}/view`,
          selected: false,
          dimensions: 'HD Image'
        });
      }
    }

    // If regex match missed, try extracting via AF_initDataCallback / data arrays
    if (files.length === 0) {
      // Secondary pattern for JS initial data: ["FILE_ID","FILENAME.jpg","image/jpeg"]
      const jsArrayRegex = /\["([a-zA-Z0-9_-]{25,45})","([^"]+\.(?:jpg|jpeg|png|webp|heic|gif|bmp))"/gi;
      let jsMatch;
      while ((jsMatch = jsArrayRegex.exec(html)) !== null) {
        const id = jsMatch[1];
        const name = jsMatch[2];
        if (!seenIds.has(id)) {
          seenIds.add(id);
          files.push({
            id,
            name,
            mimeType: name.endsWith('.png') ? 'image/png' : 'image/jpeg',
            thumbnailUrl: `/api/proxy-image?id=${id}`,
            directUrl: `https://drive.google.com/uc?id=${id}&export=download`,
            driveUrl: `https://drive.google.com/file/d/${id}/view`,
            selected: false,
            dimensions: 'HD Image'
          });
        }
      }
    }

    // Secondary fallback: find all file IDs in the folderview page
    if (files.length === 0) {
      const genericIdRegex = /"([a-zA-Z0-9_-]{25,40})"/g;
      let genMatch;
      let count = 1;
      while ((genMatch = genericIdRegex.exec(html)) !== null) {
        const id = genMatch[1];
        // Ensure id is not folderId itself
        if (id !== folderId && !seenIds.has(id) && id.length >= 28) {
          seenIds.add(id);
          files.push({
            id,
            name: `Foto_Drive_${count.toString().padStart(3, '0')}.jpg`,
            mimeType: 'image/jpeg',
            thumbnailUrl: `/api/proxy-image?id=${id}`,
            directUrl: `https://drive.google.com/uc?id=${id}&export=download`,
            driveUrl: `https://drive.google.com/file/d/${id}/view`,
            selected: false,
            dimensions: 'Original Photo'
          });
          count++;
        }
      }
    }

    return res.json({
      success: true,
      folderId,
      folderName: `Folder Google Drive (${files.length} Foto)`,
      files,
      totalParsed: files.length
    });

  } catch (error: any) {
    console.error("Error parsing drive folder:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Gagal memproses folder Google Drive."
    });
  }
});

// Parse Batch Links / Raw Text
app.post("/api/parse-drive-links", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: "Teks atau daftar link Google Drive wajib diisi." });
    }

    const items = extractFileIdsFromText(text);

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ditemukan ID atau link file Google Drive dalam teks yang dimasukkan."
      });
    }

    const files = items.map((item, index) => {
      const ext = item.filename ? path.extname(item.filename) : '.jpg';
      const defaultName = item.filename || `G_Drive_Photo_${(index + 1).toString().padStart(3, '0')}${ext}`;
      return {
        id: item.id,
        name: defaultName,
        mimeType: defaultName.endsWith('.png') ? 'image/png' : 'image/jpeg',
        thumbnailUrl: `/api/proxy-image?id=${item.id}`,
        directUrl: `https://drive.google.com/uc?id=${item.id}&export=download`,
        driveUrl: `https://drive.google.com/file/d/${item.id}/view`,
        selected: false,
        dimensions: 'Original Photo'
      };
    });

    return res.json({
      success: true,
      files,
      totalParsed: files.length
    });
  } catch (error: any) {
    console.error("Error parsing links:", error);
    return res.status(500).json({
      success: false,
      error: "Gagal memproses daftar link."
    });
  }
});

// Smart AI Extraction (using Gemini if available)
app.post("/api/ai-extract", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, error: "Teks mentah tidak boleh kosong." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to basic regex if Gemini key is missing
      const items = extractFileIdsFromText(rawText);
      const files = items.map((item, idx) => ({
        id: item.id,
        name: item.filename || `Foto_Terdeteksi_${idx + 1}.jpg`,
        mimeType: 'image/jpeg',
        thumbnailUrl: `/api/proxy-image?id=${item.id}`,
        directUrl: `https://drive.google.com/uc?id=${item.id}&export=download`,
        driveUrl: `https://drive.google.com/file/d/${item.id}/view`,
        selected: false
      }));
      return res.json({ success: true, files, totalParsed: files.length, isAiParsed: false });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analisis teks berikut yang berisi link Google Drive atau catatan nama file photo/gambar. 
Ekstrak daftar file dengan format JSON array berisi object dengan field:
- "id": (Google Drive File ID 20-50 karakter)
- "filename": (Nama file foto yang relevan dengan ekstensi seperti .jpg, .png, dll, jika tidak ada buat nama yang bermakna)

Teks yang dianalisis:
"""
${rawText}
"""

Kembalikan HANYA JSON array tanpa markdown formatting atau penjelasan tambahan.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiOutput = response.text || '';
    const jsonMatch = aiOutput.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const files = parsed.map((item: any, idx: number) => ({
        id: item.id,
        name: item.filename || `Foto_AI_${idx + 1}.jpg`,
        mimeType: item.filename?.endsWith('.png') ? 'image/png' : 'image/jpeg',
        thumbnailUrl: `/api/proxy-image?id=${item.id}`,
        directUrl: `https://drive.google.com/uc?id=${item.id}&export=download`,
        driveUrl: `https://drive.google.com/file/d/${item.id}/view`,
        selected: false
      }));
      return res.json({ success: true, files, totalParsed: files.length, isAiParsed: true });
    } else {
      // fallback
      const items = extractFileIdsFromText(rawText);
      const files = items.map((item, idx) => ({
        id: item.id,
        name: item.filename || `Foto_${idx + 1}.jpg`,
        mimeType: 'image/jpeg',
        thumbnailUrl: `/api/proxy-image?id=${item.id}`,
        directUrl: `https://drive.google.com/uc?id=${item.id}&export=download`,
        driveUrl: `https://drive.google.com/file/d/${item.id}/view`,
        selected: false
      }));
      return res.json({ success: true, files, totalParsed: files.length, isAiParsed: false });
    }
  } catch (err: any) {
    console.error("AI extraction error:", err);
    // Graceful fallback
    const items = extractFileIdsFromText(req.body.rawText || '');
    const files = items.map((item, idx) => ({
      id: item.id,
      name: item.filename || `Foto_${idx + 1}.jpg`,
      mimeType: 'image/jpeg',
      thumbnailUrl: `/api/proxy-image?id=${item.id}`,
      directUrl: `https://drive.google.com/uc?id=${item.id}&export=download`,
      driveUrl: `https://drive.google.com/file/d/${item.id}/view`,
      selected: false
    }));
    return res.json({ success: true, files, totalParsed: files.length, isAiParsed: false });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Google Drive Photo Selector running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
