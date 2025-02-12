const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// JSON 파일 경로 설정
const GND_FILE = path.join(__dirname, '../data/portfolioTargetsInvestments.json');
const HAVING_FILE = path.join(__dirname, '../data/havingStocks.json'); // 보유 중인 주식 목록

// GET
router.get('/', (req, res) => {
  try {
    // 1. 목표 데이터를 읽어옴
    const gndData = JSON.parse(fs.readFileSync(GND_FILE, 'utf-8'));
    // if (!gndData || !gndData.GNDRecommendations) {
    //   console.error('❌ 서버에서 gndData가 올바르게 로드되지 않았습니다.');
    //   return res.status(500).json({ error: 'Failed to load goal data' });
    // }

    // 2. 보유중인 주식 데이터를 읽어옴
    const havingData = JSON.parse(fs.readFileSync(HAVING_FILE, 'utf-8'));
    // if (!havingData || !Array.isArray(havingData)) {
    //   console.error('❌ 서버에서 보유 주식 데이터가 올바르지 않습니다.');
    //   return res.status(500).json({ error: 'Failed to load holding stocks data' });
    // }

    // 3. 두 데이터를 클라이언트에 전달 (필터링은 클라이언트에서 수행)
    res.json({
      gndData, // 목표 데이터: algo_v1, algo_v2 등 모든 추천 데이터 포함
      havingData, // 보유 주식 데이터
    });

    // // 3. 요청 쿼리에서 algoVersion 파라미터 추출 (없으면 기본 algo_v1 사용)
    // const algoVersion = req.query.algoVersion || 'algo_v1';
    // // 4. 해당 algoVersion에 맞는 추천 데이터를 찾음
    // const recommendation = gndData.GNDRecommendations.find(
    //   rec => rec.GNDAlgoVersion === algoVersion
    // );
    // if (!recommendation) {
    //   return res
    //     .status(404)
    //     .json({ error: `No recommendations found for algo version: ${algoVersion}` });
    // }
    // // 5. 보유중인 주식의 종목명을 배열로 추출 (앞뒤 공백 제거)
    // const holdingStockNames = havingData.map(stock => stock.stockName.trim());
    // // 6. 추천 데이터의 data 배열에서 보유중인 주식과 일치하는 항목만 필터링
    // const filteredData = recommendation.data.filter(item =>
    //   holdingStockNames.includes(item.GNDStockName.trim())
    // );
    // // 7. 결과 반환
    // res.json({
    //   algoVersion,
    //   data: filteredData,
    // });
  } catch (error) {
    console.error('목표 데이터와 보유 주식 데이터를 가져오는 중 에러가 발생했습니다.', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

module.exports = router;
