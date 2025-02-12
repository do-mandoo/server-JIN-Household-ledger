const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// JSON 데이터 파일 경로
const DATA_FILE = path.join(__dirname, '../data/publicExpenses.json');

// READ - GET
router.get('/', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).json({ error: 'Failed to read data' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// CREATE - POST
router.post('/', (req, res) => {
  const newEntry = req.body;

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).json({ error: 'Failed to read data' });
      return;
    }

    const jsonData = JSON.parse(data);
    newEntry.id = jsonData.length > 0 ? jsonData[jsonData.length - 1].id + 1 : 1;
    jsonData.push(newEntry);

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), err => {
      if (err) {
        console.error('Error writing JSON file:', err);
        res.status(500).json({ error: 'Failed to write data' });
      } else {
        res.status(201).json(newEntry);
      }
    });
  });
});

// UPDATE - PUT
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedEntry = req.body;

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).json({ error: 'Failed to read data' });
      return;
    }

    const jsonData = JSON.parse(data);
    const index = jsonData.findIndex(entry => entry.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    jsonData[index] = { ...jsonData[index], ...updatedEntry };

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), err => {
      if (err) {
        console.error('Error writing JSON file:', err);
        res.status(500).json({ error: 'Failed to write data' });
      } else {
        res.json(jsonData[index]);
      }
    });
  });
});

// DELETE - DELETE
router.delete('/', (req, res) => {
  const { ids } = req.body; // 요청 본문에서 삭제할 ID 목록을 가져옴

  console.log('🔹 Received DELETE request with IDs:', ids);
  // 요청이 유효한지 검사
  if (!ids || (Array.isArray(ids) && ids.length === 0)) {
    return res.status(400).json({ error: 'Invalid request: No IDs provided' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Failed to read data' });
    }

    try {
      let jsonData = JSON.parse(data);
      let updatedData = jsonData;

      // ✅ 전체 삭제 처리
      if (ids === 'all') {
        updatedData = [];
      }
      // ✅ 특정 ID들 삭제 (개별 또는 여러 개)
      else if (Array.isArray(ids)) {
        updatedData = jsonData.filter(entry => !ids.includes(entry.id));
      }

      // 삭제할 항목이 없는 경우
      if (jsonData.length === updatedData.length) {
        return res.status(404).json({ error: 'No matching entries found to delete' });
      }

      // json이 올바른 포맷을 유지하도록 업데이트
      fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf8', err => {
        if (err) {
          console.error('Error writing JSON file:', err);
          res.status(500).json({ error: 'Failed to write data' });
        } else {
          res.json({ message: 'Deletion successfully' });
        }
      });
    } catch (parseError) {
      console.error('Error parsing JSON: ', parseError);
      return res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

module.exports = router;
