const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// JSON 파일 경로
const DATA_FILE = path.join(__dirname, '../data/categoryBudgetSetting.json');

// READ - GET
router.get('/', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('categoryBudgetSetting.json 파일 읽기 실패:', err);
      return res.status(500).json({ error: '카테고리 예산을 읽는 중 오류가 발생했습니다.' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('categoryBudgetSetting.json 파일 파싱 오류:', parseErr);
      res.status(500).json({ error: '카테고리 예산을 파싱하는 중 오류가 발생했습니다.' });
    }
  });
});

// UPDATE - PUT
router.put('/', (req, res) => {
  const updatedData = req.body;

  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ error: '유효한 데이터가 필요합니다.' });
  }

  fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2), 'utf8', err => {
    if (err) {
      console.error('categoryBudgetSettings.json 파일 저장 실패:', err);
      return res
        .status(500)
        .json({ error: '카테고리 예산 데이터를 저장하는 중 오류가 발생했습니다.' });
    }
    res.json(updatedData);
  });
});

module.exports = router;
