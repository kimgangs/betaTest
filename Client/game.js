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
let balance = 100000; // 초기 자본 설정
let turnCount = 0; // 현재 턴 카운트 초기화
let showWeather = false; // 내일의 날씨 표시 여부
const weatherCost = 29000; // 기상청 비용
const gachaCost = 9000; // 뽑기 비용 설정

// 농산물 초기 설정
const coins = [
    { name: '당근', price: Math.floor(Math.random() * 10000 + 3000), owned: 0, img: '당근.png' },
    { name: '사과', price: Math.floor(Math.random() * 10000 + 3000), owned: 0, img: '사과.png' },
    { name: '가지', price: Math.floor(Math.random() * 10000 + 6000), owned: 0, img: '가지.png' },
    { name: '딸기', price: Math.floor(Math.random() * 10000 + 6000), owned: 0, img: '딸기.png' },
    { name: '복숭아', price: Math.floor(Math.random() * 10000 + 9000), owned: 0, img: '복숭아.png' },
    { name: '브로콜리', price: Math.floor(Math.random() * 10000 + 9000), owned: 0, img: '브로콜리.png' }
];

const priceHistory = coins.map(() => []); // 가격 기록 배열
const labels = []; // 차트 레이블 배열

const ctx = document.getElementById('priceChart').getContext('2d');

const colorMap = {
    '당근': '#FF5733',   // 예시 색상 (주황색)
    '사과': '#9B111E',   // 빨간색
    '가지': '#800080',   // 보라색
    '딸기': '#000000',   // 핑크색
    '복숭아': '#FF69B4', // 금색
    '브로콜리': '#228B22' // 녹색
};

// 차트 생성 시 options 부분에 추가
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
                        size: 16, // 글씨 크기 설정
                        weight: 'normal' // 글씨 두께 설정
                    }
                },
            },
            x: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)',
                },
                title: {
                    display: true,
                    text: '일차',
                    color: '#666',
                    font: {
                        size: 16, // 글씨 크기 설정
                        weight: 'normal' // 글씨 두께 설정
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
                    size: 16, // 글씨 크기 설정
                    weight: 'normal' // 글씨 두께 설정
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
                text: `목표: 30일 안에 500,000₩ 만들기! `,
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


// 내일의 날씨를 저장할 변수
let nextWeather = ''; 

// 초기 날씨 결정 함수
function determineNextWeather() {
    const weatherChance = Math.random();
    if (weatherChance < 0.4) {
        nextWeather = '맑음'; // 40%
    } else if (weatherChance < 0.65) {
        nextWeather = '흐림'; // 25%
    } else if (weatherChance < 0.85) {
        nextWeather = '눈비'; // 20%
    } else {
        nextWeather = '폭설'; // 15%
    }
}

// 첫 날의 날씨를 결정하고 화면에 표시
determineNextWeather();
document.getElementById('weather').style.display = 'none';

// 게임이 끝나는 조건을 확인하는 함수
function checkEndGame() {
    if (balance >= 500000) {
        alert("축하합니다! 자본이 500,000₩에 도달했습니다. 게임이 초기화됩니다.");
        logEvent(`${turnCount} 일차 게임 클리어`);
        resetGame();
        return; // 게임이 종료되었으므로 이후 로직을 실행하지 않음
    } 
    if (turnCount >= 31) {
        alert("31일차에 도달했습니다. 게임이 초기화됩니다.");
        logEvent('게임 초기화');
        resetGame();
    }
}

// 자본을 업데이트하고 게임 종료를 확인하는 함수
function updateBalance(amount) {
    balance += amount;
    updateUI();
    checkEndGame(); // 자본이 변경될 때마다 게임 종료 조건 확인
}

// 게임을 초기화하는 함수
function resetGame() {
    balance = 100000;
    turnCount = 0; // turnCount를 0으로 초기화
    
    // 코인 가격 및 보유량 초기화
    coins.forEach((coin, index) => {
        coin.price = basePrices[index]; // 기준 가격으로 재설정
        coin.owned = 0;
        priceHistory[index] = [coin.price]; // 가격 기록을 초기화하고 0일차 가격만 저장
    });

    labels.length = 0; // 레이블 배열을 비우고
    labels.push('0 일차'); // 0일차로 다시 설정

    // 차트 업데이트
    priceChart.data.labels = labels;
    priceChart.data.datasets.forEach((dataset, index) => {
        dataset.data = priceHistory[index];
    });
    
    // 차트의 타이틀을 오늘이 0일차로 업데이트
    priceChart.options.plugins.title.text = `오늘은 ${turnCount} 일차입니다`;
    priceChart.update(); // 차트를 업데이트하여 초기화된 데이터 적용
    
    // 내일의 날씨 숨김
    showWeather = false;
    document.getElementById('weather').style.display = 'none';

    // 기상청 버튼을 다시 활성화
    const weatherButton = document.getElementById('weather-button');
    weatherButton.disabled = false;
    weatherButton.innerText = `기상청 (-${weatherCost.toLocaleString()}₩)`;

    updateUI(); // UI 업데이트
    determineNextWeather(); // 다음 날의 날씨 결정
    document.getElementById('weather').innerText = `내일의 날씨: ${nextWeather}`;
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
        document.getElementById('weather').innerText = `내일의 날씨: ${nextWeather}`;
        
        alert("기상청 서비스 구매 완료! 게임이 초기화될 때까지 내일의 날씨가 보입니다.");

        // 기상청 버튼을 비활성화
        const weatherButton = document.getElementById('weather-button');
        weatherButton.disabled = true;
        weatherButton.innerText = '구매완료';
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
    labels.push('0 일차'); // 0일차 레이블 추가
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

// 이벤트 문구 업데이트 (5일 차마다)
function updateEventText() {
    const eventText = document.getElementById("event-text");
    if (turnCount % 5 === 0 && turnCount > 0) {
        eventText.innerText = `새로운 이벤트 발생! ${turnCount}일 차`;
    } else {
        eventText.innerText = "5일 차마다 새로운 이벤트가 발생합니다!";
    }
}

// 뉴스 이벤트 종류와 가격 변동 영향
const newsEvents = [
    { name: '농산물 수요 감소', effect: (price) => price * (1 - Math.random() * 0.2), message: "일부 농산물 수요 감소! 가격 하락!" },
    { name: '농산물 수요 증가', effect: (price) => price * (1 + Math.random() * 0.3), message: "일부 농산물 수요 증가! 가격 상승!" },
    { name: '농산물 수출 제한', effect: (price) => price * (1 - Math.random() * 0.15), message: "수출 제한 조치로 가격 하락!" },
    { name: '농산물 수입량 증가', effect: (price) => price * (1 - Math.random() * 0.25), message: "외국산 농산물 수입 증가로 가격 하락!" },
    { name: '비료 가격 상승', effect: (price) => price * (1 + Math.random() * 0.1), message: "비료 가격 상승으로 인해 가격 상승!" },
    { name: '농작물 병충해 피해 발생', effect: (price) => price * (1 - Math.random() * 0.1), message: "병충해 피해로 인한 가격 하락!" },
    { name: '추석 농산물 판매량 증가', effect: (price) => price * (1 + Math.random() * 0.15), message: "추석으로 인한 농산물 판매량 증가!" },
    { name: '농산물 수출량 증가', effect: (price) => price * (1 + Math.random() * 0.25), message: "국내산 농산물 수출 증가로 인한 공급 부족 가격 상승!" },
];

// 이벤트 문구를 화면에 표시하는 함수
function showEventMessage(message) {
    const eventText = document.getElementById("event-text");
    eventText.innerText = message;
}

// 가격 변동에 뉴스 이벤트 반영
function applyNewsEventEffect() {
    const randomEvent = newsEvents[Math.floor(Math.random() * newsEvents.length)]; // 랜덤 뉴스 선택
    showEventMessage(`${randomEvent.message}`);
    
    // 각 농산물의 가격에 뉴스 영향 적용
    coins.forEach((coin, index) => {
        const newPrice = Math.round(randomEvent.effect(coin.price));
        coin.price = Math.max((index <= 2) ? 500 : 9000, newPrice); // 최소 가격 제한 적용
        priceHistory[index].push(coin.price);
    });

    updateUI(); // UI 업데이트
}

function nextTurn() {
    turnCount++;
    labels.push(`${turnCount} 일차`); 
    
    // 오늘 일차를 차트 제목에 반영
    priceChart.options.plugins.title.text = `오늘은 ${turnCount} 일차입니다!`;

    // 날씨 및 가격 업데이트 로직 실행
    const weather = nextWeather;
    determineNextWeather();

    if (showWeather) {
        document.getElementById('weather').style.display = 'block';
        document.getElementById('weather').innerText = `내일의 날씨: ${nextWeather}`;
    } else {
        document.getElementById('weather').style.display = 'none';
    }

    // 뉴스 이벤트 처리
    if (turnCount % 5 === 0) {
        applyNewsEventEffect();
    } else {
        // 일반적인 가격 변동 적용
        coins.forEach((coin, index) => {
            let change;
        
        // 각 코인마다 고유한 변동 폭 설정
        switch (index) {
            case 0: change = (Math.random() * 0.8 - 0.35); break;
            case 1: change = (Math.random() * 0.7 - 0.3); break;
            case 2: change = (Math.random() * 0.6 - 0.25); break;
            case 3: change = (Math.random() * 0.5 - 0.2); break;
            case 4: change = (Math.random() * 0.4 - 0.15); break;
            case 5: change = (Math.random() * 0.3 - 0.1); break;
        }
        
        // 평균 회귀 로직 및 날씨 효과 적용
        const meanReversionProbability = 0.4; 
        if (coin.price < basePrices[index] && Math.random() < meanReversionProbability) {
            change += (basePrices[index] - coin.price) / basePrices[index] * 0.2;
        }

        switch (weather) {
            case '맑음': change -= 0.1; break;
            case '흐림': change += (Math.random() * 0.1 - 0.05); break;
            case '눈비': change += (Math.random() * 0.05 + 0.05); break;
            case '폭설': change += (Math.random() * 0.05 + 0.15); break;
        }

        const minPrice = (index <= 2) ? 500 : 9000; 
        coin.price = Math.max(minPrice, Math.round(coin.price * (1 + change)));
        priceHistory[index].push(coin.price);
    });
    }
    
    priceChart.data.labels = labels;
    priceChart.update();
    
    // 팝업 차트가 열려 있는 경우, 팝업 차트도 업데이트
    if (document.getElementById("popup-chart").style.display === "block") {
        window.popupChart.data.labels = labels;
        window.popupChart.data.datasets.forEach((dataset, index) => {
            dataset.data = priceHistory[index];
        });
        window.popupChart.update();
    }

    updateUI();
    checkEndGame(); 
}
