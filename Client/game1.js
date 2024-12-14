window.onload = function() {
    alert("제한시간(04:00 ~ 07:00) 안에 최대한 많은 금액을 벌어 랭킹에 도전해보세요 !");
};
 // 이벤트 기록 함수
 function logEvent(eventType) {
    const userId = localStorage.getItem('studentId'); // 로그인한 사용자 ID를 로컬 스토리지에서 가져옵니다.

    const data = {
        userId: userId,
        eventType: eventType,
        comment: `${userId} ${eventType}` // 코멘트 형식
    };

    fetch("https://script.google.com/macros/s/AKfycbyCrewjcnY3AbPE5vhv5_flwxlQMucC49Nu9GRxH1yQWQS62BIAQJ09JJmQULVIJ9-Bfw/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        mode: "no-cors"
    })
    .then(response => {
        if (response.ok) {
            console.log("로그 기록 성공");
        } else {
            console.error("로그 기록 실패");
        }
    })
    .catch(error => {
        console.error("네트워크 오류:", error);
     });
}
let balance = 1000000; // 초기 자본 설정
let turnCount = 0; // 현재 턴 카운트 초기화
let showWeather = false; // 내일의 날씨 표시 여부
const weatherCost = 29000; // 기상청 비용
const gachaCost = 9000; // 뽑기 비용 설정

// 농산물 초기 설정
const coins = [
    { name: '당근', price: Math.floor(Math.random() * 7001 + 3000), owned: 0, img: '당근.png' },
    { name: '사과', price: Math.floor(Math.random() * 7001 + 3000), owned: 0, img: '사과.png' },
    { name: '가지', price: Math.floor(Math.random() * 7001 + 3000), owned: 0, img: '가지.png' },
    { name: '딸기', price: Math.floor(Math.random() * 7001 + 3000), owned: 0, img: '딸기.png' },
    { name: '복숭아', price: Math.floor(Math.random() * 7001 + 3000), owned: 0, img: '복숭아.png' },
    { name: '브로콜리', price: Math.floor(Math.random() * 7001 + 3000), owned: 0, img: '브로콜리.png' }
];

const ctx = document.getElementById('priceChart').getContext('2d');

const colorMap = {
    '당근': '#FF5733',   // 예시 색상 (주황색)
    '사과': '#9B111E',   // 빨간색
    '가지': '#800080',   // 보라색
    '딸기': '#000000',   // 핑크색
    '복숭아': '#FF69B4', // 금색
    '브로콜리': '#228B22' // 녹색
};

let currentGameTime = { hours: 4, minutes: 0 }; // 게임 시작 시간

const labels = []; // 시간 기준으로 레이블 배열
const priceHistory = coins.map(() => []); // 가격 기록 배열

// 차트 생성 시 시간 기준으로 설정
const priceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: coins.map((coin, index) => ({
            label: coin.name,
            data: priceHistory[index],
            borderColor: colorMap[coin.name],
            backgroundColor: colorMap[coin.name] + '33',
            fill: false,
            borderWidth: 3,
            pointRadius: 1,
            pointBackgroundColor: colorMap[coin.name],
            pointBorderWidth: 1,
            tension: 0.3
        })),
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)',
                },
                title: {
                    display: true,
                    text: '가격 (₩)',
                    color: '#666',
                    rotation: 270,
                    font: {
                        size: 16,
                        weight: 'normal'
                    }
                },
            },
            x: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)',
                },
                title: {
                    display: true,
                    text: '시간',
                    color: '#666',
                    font: {
                        size: 16,
                        weight: 'normal'
                    }
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                font: {
                    size: 16,
                    weight: 'normal'
                }
            },
            legend: {
                position: 'top',
                labels: {
                    color: '#333',
                    font: {
                        size: 14,
                        weight: 'normal'
                    }
                }
            },
            title: {
                display: true,
                text: `목표: 최대한 많은 금액 만들기!`,
                color: '#333',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        layout: {
            padding: 10,
        }
    },
    plugins: [{
        beforeDraw: function(chart) {
            const ctx = chart.canvas.getContext('2d');
            ctx.save();
            ctx.fillStyle = '#F5F5DC'; // 배경색 설정
            ctx.fillRect(0, 0, chart.width, chart.height); // 캔버스 전체에 흰색 배경 그리기
            ctx.restore();
        }
    }]
});

// 게임 시간 초기화 (09:00)
const endGameTime = { hours: 7, minutes: 0 };

// 시계 업데이트 함수
function updateClock() {
    // 게임 시간이 15:00을 넘어가면 종료
    if (currentGameTime.hours >= endGameTime.hours && currentGameTime.minutes >= endGameTime.minutes) {
        document.getElementById("message").textContent = "게임 종료! 15:00이 되었습니다.";
        return;
    }

    // 게임 시간 1분 증가 (1초마다)
    currentGameTime.minutes++;

    // 60분이 되면 시간 추가
    if (currentGameTime.minutes >= 60) {
        currentGameTime.minutes = 0;
        currentGameTime.hours++;
    }

    // 시간 표시 (09:00 형식으로)
    const formattedTime = `${currentGameTime.hours.toString().padStart(2, '0')}:${currentGameTime.minutes.toString().padStart(2, '0')}`;
    document.getElementById("clock").textContent = formattedTime;

    checkEndGame();
    
}
// 1초마다 시계 업데이트
setInterval(updateClock, 1000);

// 페이지 로드 시에도 시계 업데이트
updateClock();
    
// 내일의 날씨를 저장할 변수
let newsEvents = ''; 

// 초기 날씨 결정 함수
function determineNextWeather() {
    const newsEvents = [
        '농산물 가격 상승! 대형 식당 체인, 대규모 구매 계약 체결',
        '폭우로 인해 농산물 작황 부진... 가격 상승 예상',
        '농산물, 건강 열풍으로 인기 상승! 소비자 관심 집중',
        '농산물 대풍작! 생산량 급증으로 가격 하락세',
        '농산물, 품질 논란 발생! 주요 유통업체 거래 중단',
        '농산물 수출 호황! 해외 수요 폭발로 가격 상승',
        '농산물 대풍작 소식! 생산량 급증으로 가격 하락세 지속',
        '농산물 수입 확대! 국내 농산물 가격 경쟁 심화로 하락세'
    ];

    // 0 ~ 7 사이의 랜덤 인덱스 생성
    const randomIndex = Math.floor(Math.random() * newsEvents.length);
    newsEvent = newsEvents[randomIndex];
}

// 첫 날의 날씨를 결정하고 화면에 표시
determineNextWeather();
document.getElementById('weather').style.display = 'none';

// 자본을 업데이트하고 게임 종료를 확인하는 함수
function updateBalance(amount) {
    balance += amount;
    updateUI();
    checkEndGame(); // 자본이 변경될 때마다 게임 종료 조건 확인
}

// 게임을 초기화하는 함수
function resetGame() {
    balance = 1000000;
    currentGameTime = { hours: 4, minutes: 0 };

    // 코인 가격 및 보유량 초기화
    coins.forEach((coin, index) => {
        coin.price = basePrices[index]; // 기준 가격으로 재설정
        coin.owned = 0;
        priceHistory[index] = [coin.price]; // 가격 기록을 초기화하고 0일차 가격만 저장
    });

    labels.length = 0; // 레이블 배열을 비우고
    labels.push('4:0'); // 게임 시작 시간으로 설정

    // 차트 업데이트
    priceChart.data.labels = labels;
    priceChart.data.datasets.forEach((dataset, index) => {
        dataset.data = priceHistory[index];
    });

    // 차트의 타이틀을 오늘이 0일차로 업데이트
    //priceChart.options.plugins.title.text = `현재시간 : ${formattedTime}`;
    priceChart.update(); // 차트를 업데이트하여 초기화된 데이터 적용

    // 내일의 날씨 숨김
    showWeather = false;
    document.getElementById('weather').style.display = 'none';

    // 기상청 버튼을 다시 활성화
    const weatherButton = document.getElementById('weather-button');
    weatherButton.disabled = false;  // 버튼 활성화
    weatherButton.innerText = `뉴스 구독 (-${weatherCost.toLocaleString()}₩)`;  // 버튼 텍스트 초기화

    updateUI(); // UI 업데이트
    determineNextWeather(); // 다음 날의 날씨 결정
    document.getElementById('weather').innerText = `${newsEvents}`;
}

function updateUI() {
    // 현재 자본을 3자리마다 쉼표가 포함된 형식으로 표시
    document.getElementById('balance').innerText = `${balance.toLocaleString()}₩`;

     // 뽑기 버튼 가격 업데이트
     const gachaButton = document.getElementById('gacha-button');
     const gachaCost = calculateGachaPrice();
     gachaButton.innerText = `뽑기 (-${gachaCost.toLocaleString()}₩)`;
    
    const coinContainer = document.getElementById('coins');
    coinContainer.innerHTML = ''; // 매번 새로 갱신하기 위해 초기화

    coins.forEach((coin, index) => {
        if (index % 3 === 0) {
            rowDiv = document.createElement('div');
            rowDiv.className = 'coin-row';
            coinContainer.appendChild(rowDiv);
        }

        const coinWrapper = document.createElement('div');
        coinWrapper.className = 'coin-wrapper';
        coinWrapper.innerHTML = `
            <img src="${coin.img}" alt="${coin.name}">
            <div class="coin">
                <div class="coin-content">
                    <h2>${coin.name}</h2>
                    <p>가격: ${coin.price.toLocaleString()}₩</p>
                    <p>보유량: ${coin.owned}</p>
                    <button onclick="buyCoin(${index}); logEvent(' ${coin.name}구매 ');">구매</button>
                    <button onclick="sellCoin(${index}); logEvent(' ${coin.name}판매 ');">판매</button>
                    <button onclick="buyAll(${index}); logEvent(' ${coin.name}전량구매 ');">전량구매</button>
                    <button onclick="sellAll(${index}); logEvent(' ${coin.name}전량판매 ');">전량판매</button>
                </div>
            </div>
        `;
        rowDiv.appendChild(coinWrapper);
});
}

// 코인 구매, 판매 및 전량매수/매도 함수
function buyCoin(index) {
    const coin = coins[index];
    if (balance >= coin.price) {
        updateBalance(-coin.price);
        coin.owned += 1;
        updateUI();
    } else {
        alert('자본이 부족합니다.');
    }
}

function sellCoin(index) {
    const coin = coins[index];
    if (coin.owned > 0) {
        updateBalance(coin.price);
        coin.owned -= 1;
        updateUI();
    } else {
        alert('보유한 농산물이 없습니다.');
    }
}

// 전량매수 함수
function buyAll(index) {
    const coin = coins[index];
    const maxAffordableCoins = Math.floor(balance / coin.price);
    if (maxAffordableCoins > 0) {
        updateBalance(-maxAffordableCoins * coin.price);
        coin.owned += maxAffordableCoins;
        updateUI();
    } else {
        alert('자본이 부족합니다.');
    }
}

// 전량매도 함수
function sellAll(index) {
    const coin = coins[index];
    if (coin.owned > 0) {
        updateBalance(coin.owned * coin.price);
        coin.owned = 0;
        updateUI();
    } else {
        alert('보유한 농산물이 없습니다.');
    }
}

// 과금하기 기능도 자동 종료 확인 추가
function addFunds(amount) {
    updateBalance(amount); // 선택한 금액을 추가하고 종료 조건 확인
}

function togglePaymentOptions() {
    const paymentOptions = document.getElementById('payment-options');
    paymentOptions.style.display = paymentOptions.style.display === 'none' ? 'block' : 'none';
}

// 뽑기 가격을 계산하는 함수
function calculateGachaPrice() {
    const totalPrice = coins.reduce((sum, coin) => sum + coin.price, 0); // 모든 농산물 가격의 합
    return Math.round(totalPrice / coins.length); // 가격의 평균을 계산하고 반올림
}

function drawGacha() {
    const gachaCost = calculateGachaPrice(); // 뽑기 가격을 매번 평균값으로 설정

    if (balance >= gachaCost) {
        updateBalance(-gachaCost); // 자본에서 9000₩ 차감

        // 농산물 랜덤 선택 (0~5 범위의 인덱스를 랜덤으로 선택)
        const randomIndex = Math.floor(Math.random() * coins.length);
        const selectedCoin = coins[randomIndex];
        
        // 선택된 농산물 보유량 증가
        selectedCoin.owned += 1;

        // 알림 표시 및 UI 업데이트
        alert(`${selectedCoin.name}을(를) 획득했습니다!`);
        updateUI();
    } else {
        alert('자본이 부족합니다.');
    }
}

function purchaseWeatherInfo() {
    if (balance >= weatherCost) {
        updateBalance(-weatherCost);
        showWeather = true;

        document.getElementById('weather').style.display = 'block'; // 내일의 날씨 표시
        document.getElementById('weather').innerText = `${newsEvents}`;
        
        alert("신문 구독 완료! 게임이 초기화될 때까지 신문의 문구가 보입니다.");

        // 기상청 버튼을 비활성화
        const weatherButton = document.getElementById('weather-button');
        weatherButton.disabled = true;
        weatherButton.innerText = '구독완료';
    } else {
        alert('자본이 부족합니다.');
    }
}

// 각 코인의 기준 가격 설정
const basePrices = coins.map(coin => coin.price);

// 초기 가격과 0일차 데이터 설정
function initializePriceHistory() {
    coins.forEach((coin, index) => {
        priceHistory[index].push(coin.price); // 초기 가격을 0일차에 추가
    });
    labels.push('4:0'); // 0일차 레이블 추가
}

// 초기화 함수 호출 및 UI 업데이트
initializePriceHistory();
updateUI();
priceChart.update(); // 차트를 업데이트하여 0일차 가격을 표시

function openPopup() {
    document.getElementById("popup-chart").style.display = "block";
    const popupCtx = document.getElementById("popupPriceChart").getContext("2d");
    if (!window.popupChart) {
        window.popupChart = new Chart(popupCtx, priceChart.config); // 기존 차트 설정 복사
    } else {
        window.popupChart.update(); // 기존 차트가 있으면 업데이트
    }
}

function closePopup() {
    document.getElementById("popup-chart").style.display = "none";
}

let priceIntervalId;
let weatherIntervalId;

function startGameLoop() {
    // Clear any existing intervals
    if (priceIntervalId) {
        clearInterval(priceIntervalId);
    }
    if (weatherIntervalId) {
        clearInterval(weatherIntervalId);
    }


    // Run updatePrices every second (1000ms)
    priceIntervalId = setInterval(updatePrices, 1000);

    // Run updateWeather every 10 seconds (10000ms)
    weatherIntervalId = setInterval(updateWeather, 30000);

}

function gameLoop() {
    updatePrices();
    updateWeather();
}

// 게임 시작 시 루프 시작
startGameLoop();


function updateChart() {
    // 가격 데이터와 레이블 갱신
    labels.push(`${currentGameTime.hours}:${currentGameTime.minutes}`);
    coins.forEach((coin, index) => {
        priceHistory[index].push(coin.price);
    });

    // 차트 데이터 설정
    priceChart.data.labels = labels;
    priceChart.data.datasets.forEach((dataset, index) => {
        dataset.data = priceHistory[index];
    });

    // 차트 업데이트
    priceChart.update();
}

function updatePrices() {
    labels.push(`${currentGameTime.hours}:${currentGameTime.minutes}`);
    
    // 가격 변동 및 가격 기록
    coins.forEach((coin, index) => {
        let change;
        
        // 각 코인마다 고유한 변동 폭 설정
        switch (index) {
            case 0: change = (Math.random() * 0.2 - 0.1); break;
            case 1: change = (Math.random() * 0.2 - 0.1); break;
            case 2: change = (Math.random() * 0.2 - 0.1); break;
            case 3: change = (Math.random() * 0.2 - 0.1); break;
            case 4: change = (Math.random() * 0.2 - 0.1); break;
            case 5: change = (Math.random() * 0.2 - 0.1); break;
        }

        // 평균 회귀 로직 및 날씨 효과 적용
        const meanReversionProbability = 0.4; 
        if (coin.price < basePrices[index] && Math.random() < meanReversionProbability) {
            change += (basePrices[index] - coin.price) / basePrices[index] * 0.2;
        }

        const minPrice = (index <= 2) ? 500 : 9000; 
        coin.price = Math.max(minPrice, Math.round(coin.price * (1 + change)));
        priceHistory[index].push(coin.price);
    });

// 날씨에 따른 가격 변동 적용 함수
function applyWeatherImpact() {
    coins.forEach((coin, index) => {
        let change = 0;

        // 날씨 효과 적용
        switch (newsEvent) {
            case '농산물 가격 상승! 대형 식당 체인, 대규모 구매 계약 체결':
                change += 0.30;
                break;
            case '폭우로 인해 농산물 작황 부진... 가격 상승 예상':
                change += 0.05;
                break;
            case '농산물, 건강 열풍으로 인기 상승! 소비자 관심 집중':
                change = Math.random() * 0.02 + 0.01; // 가격 1~3% 증가
                break;
            case '농산물 대풍작! 생산량 급증으로 가격 하락세':
                change = Math.random() * -0.02 - 0.01;
                break;
            case '농산물, 품질 논란 발생! 주요 유통업체 거래 중단':
                change = -0.30; // 무조건 30% 하락
                break;
            case '농산물 수출 호황! 해외 수요 폭발로 가격 상승설':
                change = Math.random() * 0.02 + 0.03; // 가격 3~5% 증가
                break;
            case '농산물 대풍작 소식! 생산량 급증으로 가격 하락세 지속':
                change = Math.random() * -0.01 - 0.02; // 가격 2~3% 하락
                break;
            case '농산물 수입 확대! 국내 농산물 가격 경쟁 심화로 하락세':
                change -= 0.05;
                break;
        }

        // 강제로 가격이 오르지 않도록 제한
        if (newsEvent === '농산물, 품질 논란 발생! 주요 유통업체 거래 중단') {
            change = Math.min(change, -0.01); // 무조건 음수로 강제
        }

        const minPrice = (index <= 2) ? 500 : 9000; // 최소 가격
        coin.price = Math.max(minPrice, Math.round(coin.price * (1 + change))); // 변동된 가격 적용
        priceHistory[index].push(coin.price); // 가격 기록 저장
    });

    updateChart(); // 차트 업데이트
    updateUI(); // UI 업데이트
}
    // 차트 업데이트
    priceChart.update();

    // 팝업 차트가 열려 있는 경우 팝업 차트도 업데이트
    if (document.getElementById("popup-chart").style.display === "block") {
        window.popupChart.data.labels = labels;
        window.popupChart.data.datasets.forEach((dataset, index) => {
            dataset.data = priceHistory[index];
        });
        window.popupChart.update();
    };
    updateUI(); // UI 업데이트
    checkEndGame();
}
// 날씨 업데이트 함수 수정
function updateWeather() {
    const previousWeather = newsEvents; // 이전 날씨를 저장
    determineNextWeather(); // 새로운 날씨 결정

    if (showWeather) {
        document.getElementById('weather').style.display = 'block';
        document.getElementById('weather').innerText = `${newsEvent}`;
    }

    // 날씨가 변경되었을 때만 가격 변동 적용
    if (newsEvents !== previousWeather) {
        applyWeatherImpact();
    }
}

// 게임 시계 및 날짜 갱신
function updateClock() {
    currentGameTime.minutes++;
    if (currentGameTime.minutes >= 60) {
        currentGameTime.minutes = 0;
        currentGameTime.hours++;
    }

    const formattedTime = `${currentGameTime.hours.toString().padStart(2, '0')}:${currentGameTime.minutes.toString().padStart(2, '0')}`;
    document.getElementById('clock').textContent = `현재 시간: ${formattedTime}`;
}


// 랭킹 데이터 불러오기
function loadRanking() {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    return ranking;
}

// 랭킹 데이터 저장하기
function saveRanking(ranking) {
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

// 랭킹 업데이트하기
function updateRanking(playerName, finalBalance) {
    const ranking = loadRanking();
    ranking.push({ name: playerName, balance: finalBalance });
    ranking.sort((a, b) => b.balance - a.balance); // 내림차순 정렬
    saveRanking(ranking.slice(0, 5)); // 상위 5명만 저장
}

// 랭킹 팝업 열기
function showRanking() {
    const rankingList = document.getElementById('ranking-list');
    const ranking = loadRanking();

    rankingList.innerHTML = ranking.map((entry, index) =>
        `<p>${index + 1}위: ${entry.name} - ${entry.balance.toLocaleString()}₩</p>`
    ).join('');

    document.getElementById('ranking-popup').style.display = 'block';
}

// 랭킹 팝업 닫기
function closeRankingPopup() {
    document.getElementById('ranking-popup').style.display = 'none';
}

const RANKING_API_URL = "https://script.google.com/macros/s/AKfycbx9j0f_tbSPNleFg3PmnLaUap73kUv-OLTs8so920gWkyRrurN7QJh8DhYjCIhC0tt6/exec"; // Google Apps Script URL로 변경

// 서버에서 랭킹 데이터를 불러오는 함수
async function loadRanking() {
    try {
        const response = await fetch(RANKING_API_URL);
        const ranking = await response.json();
        return ranking;
    } catch (error) {
        console.error("랭킹 불러오기 오류:", error);
        return [];
    }
}

// 서버에 랭킹 데이터를 저장하는 함수
async function saveRanking(playerName, finalBalance) {
    const data = { name: playerName, balance: finalBalance };

    try {
        await fetch(RANKING_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            mode : "no-cors"
        });
        console.log("랭킹 저장 성공");
    } catch (error) {
        console.error("랭킹 저장 오류:", error);
    }
}

// 랭킹 팝업 열기 (서버에서 랭킹 불러오기)
async function showRanking() {
    const rankingList = document.getElementById('ranking-list');
    const ranking = await loadRanking();

    rankingList.innerHTML = ranking.map((entry, index) =>
        `<p>${index + 1}위: ${entry.name} - ${entry.balance.toLocaleString()}₩</p>`
    ).join('');

    document.getElementById('ranking-popup').style.display = 'block';
}

// 게임 종료 시 랭킹 저장
function checkEndGame() {
    if (currentGameTime.hours >= endGameTime.hours && currentGameTime.minutes >= endGameTime.minutes) {
        const playerName = prompt("플레이어 이름을 입력하세요:");
        alert("07:00에 도달했습니다. 게임이 종료됩니다.");

        saveRanking(playerName, balance); // 서버에 랭킹 저장
        resetGame();
    }
}
