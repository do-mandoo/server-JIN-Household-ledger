const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// JSON 파일 경로 설정
const ADVISE_FILE = path.join(__dirname, '../data/adviseStocks.json'); // 알고리즘 추천 주식
const INTERESTED_FILE = path.join(__dirname, '../data/interestedStocks.json'); // 사용자가 추가한 관심 주식
const HAVING_FILE = path.join(__dirname, '../data/havingStocks.json'); // 보유 중인 주식 목록

// GET - 알고리즘 추천 데이터 + 사용자가 추가한 관심 주식 데이터 반환
router.get('/', (req, res) => {
  try {
    const advise = JSON.parse(fs.readFileSync(ADVISE_FILE, 'utf8'));
    const interested = JSON.parse(fs.readFileSync(INTERESTED_FILE, 'utf8'));

    // 데이터가 undefined인지 확인
    if (!advise || !advise.algoRecommendations) {
      console.error('❌ 서버에서 adviseData가 undefined!');
      return res.status(500).json({ error: 'Failed to load adviseStocks data' });
    }
    res.json({
      adviseData: advise.algoRecommendations,
      interestedData: interested,
    });
  } catch (err) {
    console.error('Error reading JSON file:', err);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST - 관심 주식 추가 (interestedStocks.json에 저장)
router.post('/', (req, res) => {
  const newStock = req.body;

  if (!newStock.date || !newStock.stockName || !newStock.quantity || !newStock.currentPrice) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }

  try {
    const interestedData = JSON.parse(fs.readFileSync(INTERESTED_FILE, 'utf8'));
    const havingData = JSON.parse(fs.readFileSync(HAVING_FILE, 'utf8'));

    // 이미 보유 중인 주식인지 확인
    const isAlreadyOwned = havingData.some(stock => stock.stockName === newStock.stockName);
    if (isAlreadyOwned) {
      return res.status(400).json({ error: `'${newStock.stockName}'은(는) 이미 보유 중입니다.` });
    }

    // 이미 관심 목록에 있는 주식인지 확인
    const isAlreadyInterested = interestedData.some(
      stock => stock.stockName === newStock.stockName
    );
    if (isAlreadyInterested) {
      return res
        .status(400)
        .json({ error: `'${newStock.stockName}'은(는) 이미 관심 목록에 추가되었습니다.` });
    }

    // 새로운 ID 생성
    newStock.id = interestedData.length > 0 ? interestedData[interestedData.length - 1].id + 1 : 1;

    // 관심 목록에 추가
    interestedData.push(newStock);

    // 파일 저장
    fs.writeFileSync(INTERESTED_FILE, JSON.stringify(interestedData, null, 2));

    res.status(201).json(newStock);
  } catch (err) {
    console.error('Error writing JSON file:', err);
    res.status(500).json({ error: 'Failed to write data' });
  }
});

// DELETE - 관심 주식 삭제 (interestedStocks.json에서 삭제)
router.delete('/', (req, res) => {
  const { stockName } = req.body;

  if (!stockName) {
    return res.status(400).json({ error: '삭제할 주식 이름을 제공해야 합니다.' });
  }

  try {
    const interestedData = JSON.parse(fs.readFileSync(INTERESTED_FILE, 'utf8'));

    // 해당 stockName이 존재하는지 확인
    const stockExists = interestedData.some(stock => stock.stockName === stockName);
    if (!stockExists) {
      return res.status(404).json({ error: '해당 주식을 찾을 수 없습니다.' });
    }

    // 해당 주식을 제외한 나머지 데이터 필터링
    const updatedData = interestedData.filter(stock => stock.stockName !== stockName);

    // 파일 저장
    fs.writeFileSync(INTERESTED_FILE, JSON.stringify(updatedData, null, 2));

    res.status(200).json({ message: `'${stockName}' 주식이 관심 목록에서 삭제되었습니다.` });
  } catch (err) {
    console.error('Error writing JSON file:', err);
    res.status(500).json({ error: 'Failed to write data' });
  }
});

module.exports = router;
