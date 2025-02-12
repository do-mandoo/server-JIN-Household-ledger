const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// // CORS 허용
// app.use(cors());
// // app.use(cors({ origin: 'http://localhost:3000' })); // 클라이언트 URL을 허용

// // JSON 요청 파싱
// app.use(express.json());

// CORS 허용 (특정 클라이언트만 허용)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// JSON 요청 파싱 (body-parser 대체)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터도 처리 가능

// 라우터 연결
const savingsRoutes = require('./routes/savings');
const publicExpensesRoutes = require('./routes/publicExpenses');
const personalExpensesRoutes = require('./routes/personalExpenses');
const havingStocksRoutes = require('./routes/havingStocks');
const adviseStocksRoutes = require('./routes/adviseStocks');
const maxiWeightSettingRoutes = require('./routes/maxiWeightSetting');
const categoryBudgetSettingRoutes = require('./routes/categoryBudgetSetting');

app.use('/savings', savingsRoutes); // 수입
app.use('/publicExpenses', publicExpensesRoutes); // 지출 - 공금 지출
app.use('/personalExpenses', personalExpensesRoutes); // 지출 - 개인 지출
app.use('/havingStocks', havingStocksRoutes); // 투자 - 보유 주식
app.use('/adviseStocks', adviseStocksRoutes); // 투자 - 관심 목록
app.use('/maxiWeightSetting', maxiWeightSettingRoutes); // 분석 - 투자()
app.use('/categoryBudgetSetting', categoryBudgetSettingRoutes); // 분석 - 지출(예산 설정)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Node.js 서버가 실행 중입니다람쥐!');
});

// 404 에러 처리 (잘못된 API 요청 방지)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 글로벌 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 서버 실행
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
