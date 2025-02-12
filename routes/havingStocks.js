const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// JSON 파일 경로
const DATA_FILE = path.join(__dirname, '../data/havingStocks.json');
const INTERESTED_FILE = path.join(__dirname, '../data/interestedStocks.json');

// READ - GET
router.get('/', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).json({ error: 'Failed to read data' });
      return;
    }

    res.json(JSON.parse(data)); // JSON 데이터를 클라이언트로 반환
  });
});

// 📌 2. 새로운 주식을 추가하는 POST 요청 (기존 주식이 있으면 수정)
// router.post('/', (req, res) => {
//   const newEntry = req.body;

//   fs.readFile(DATA_FILE, 'utf8', (err, havingData) => {
//     if (err) {
//       console.error('Error reading Having JSON file:', err);
//       return res.status(500).json({ error: 'Failed to read havingData data' });
//     }

//     let havingStocks = JSON.parse(havingData);

//     // 보유주식 목록에 같은 stockName이 있는지 확인
//     const existingStock = havingStocks.find(stock => stock.stockName === newEntry.stockName);

//     if (existingStock) {
//       // 보유주식 목록의 수량과 새로운 수량 합산
//       existingStock.quantity += newEntry.quantity;

//       // 가중 평균을 이용한 새로운 purchasePrice 계산
//       existingStock.purchasePrice = Math.round(
//         (existingStock.quantity * existingStock.purchasePrice +
//           newEntry.quantity * newEntry.purchasePrice) /
//           existingStock.quantity
//       );
//     } else {
//       // 새로운 ID 생성
//       newEntry.id = havingStocks.length > 0 ? havingStocks[havingStocks.length - 1].id + 1 : 1;

//       // 새 데이터를 추가
//       havingStocks.push(newEntry);
//     }

//     // havingStocks.json에 저장
//     fs.writeFile(DATA_FILE, JSON.stringify(havingStocks, null, 2), err => {
//       if (err) {
//         console.error('Error writing Having JSON file:', err);
//         return res.status(500).json({ error: 'Failed to write HavingStocks data' });
//       }

//       // 보유 주식에 추가된 종목을 interestedStocks.json에서 자동 삭제
//       fs.readFile(INTERESTED_FILE, 'utf8', (err, interestedData) => {
//         if (err) {
//           console.error('Error reading INTERESTED JSON file:', err);
//           return res.status(500).json({ error: 'Failed to read interestedStocks data' });
//         }

//         let interestedStocks = JSON.parse(interestedData);

//         // 관심 목록에서 해당 주식 제거
//         const filteredStocks = interestedStocks.filter(
//           stock => stock.stockName !== newEntry.stockName
//         );

//         // interestedStocks.json에 저장
//         fs.writeFile(INTERESTED_FILE, JSON.stringify(filteredStocks, null, 2), err => {
//           if (err) {
//             console.error('Error writing INTERESTED JSON file:', err);
//             res.status(500).json({ error: 'Failed to write interestedStocks data' });
//           } else {
//             res.status(201).json(newEntry); // 업데이트된 보유 주식 반환
//           }
//         });
//       });
//     });
//   });
// });

router.post('/', async (req, res) => {
  const newEntry = req.body;

  try {
    // ✅ havingStocks.json 읽기
    let havingStocks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // ✅ 기존에 같은 stockName이 있는지 확인
    const existingStock = havingStocks.find(stock => stock.stockName === newEntry.stockName);

    if (existingStock) {
      // ✅ 기존 수량과 새로운 수량 합산
      const totalQuantity = existingStock.quantity + newEntry.quantity;

      // ✅ 가중 평균 계산
      existingStock.purchasePrice = Math.round(
        (existingStock.quantity * existingStock.purchasePrice +
          newEntry.quantity * newEntry.purchasePrice) /
          totalQuantity
      );

      // ✅ 새로운 총 수량 업데이트
      existingStock.quantity = totalQuantity;
    } else {
      // ✅ 새로운 ID 생성
      newEntry.id = havingStocks.length > 0 ? havingStocks[havingStocks.length - 1].id + 1 : 1;
      havingStocks.push(newEntry);
    }

    // ✅ havingStocks.json 업데이트 (비동기 처리)
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(havingStocks, null, 2));

    // ✅ interestedStocks.json 읽기
    let interestedStocks = JSON.parse(fs.readFileSync(INTERESTED_FILE, 'utf8'));

    // ✅ 관심 목록에서 해당 주식 제거
    interestedStocks = interestedStocks.filter(stock => stock.stockName !== newEntry.stockName);

    // ✅ interestedStocks.json 업데이트 (비동기 처리)
    await fs.promises.writeFile(INTERESTED_FILE, JSON.stringify(interestedStocks, null, 2));

    // ✅ 클라이언트에 최신 데이터 반환
    res.status(201).json(existingStock || newEntry);
  } catch (err) {
    console.error('Error updating stocks:', err);
    res.status(500).json({ error: 'Failed to update stock data' });
  }
});

// DELETE-DELETE
router.delete('/', (req, res) => {
  const { stockName } = req.body; // 요청 body에서 stockName 가져오기

  if (!stockName) {
    return res.status(400).json({ error: '삭제할 주식 이름을 제공해야 합니다.' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Failed to read data' });
    }

    let jsonData = JSON.parse(data);

    // stockName이 존재하는지 확인
    const filteredStocks = jsonData.filter(stock => stock.stockName !== stockName);

    if (filteredStocks.length === jsonData.length) {
      return res.status(404).json({ message: '해당 주식을 찾을 수 없습니다.' });
    }

    // JSON 파일에 저장
    fs.writeFile(DATA_FILE, JSON.stringify(filteredStocks, null, 2), err => {
      if (err) {
        console.error('Error writing JSON file:', err);
        return res.status(500).json({ error: 'Failed to write data' });
      }
      return res.status(200).json({ message: `'${stockName}' 주식이 삭제되었습니다.` });
    });
  });
});

module.exports = router;
