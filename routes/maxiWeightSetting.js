const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// JSON 파일 경로
const DATA_FILE = path.join(__dirname, '../data/maxiWeightSetting.json');

// READ - GET
router.get('/', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('maxiWeightSetting.json 파일 읽기 실패:', err);
      return res.status(500).json({ error: '최대 백분율 데이터를 읽는 중 오류가 발생했습니다.' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('maxiWeightSetting.json 파일 파싱 오류:', parseErr);
      res.status(500).json({ error: '최대 백분율 데이터를 파싱하는 중 오류가 발생했습니다.' });
    }
  });
});

// CREATE - POST
router.post('/', (req, res) => {
  const { maxPercent } = req.body; // 구조 분해 할당으로 받기

  if (maxPercent === undefined) {
    return res.status(400).json({ error: 'maxPercent 값이 필요합니다.' });
  }

  const newData = { maxPercent }; // 객체 형태로 저장

  fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', err => {
    if (err) {
      console.error('maxiWeightSetting.json 파일 저장 실패:', err);
      return res
        .status(500)
        .json({ error: '최대 백분율 데이터를 저장하는 중 오류가 발생했습니다.' });
    }
    res.json(newData);
  });
});

module.exports = router;
