// Google Apps Script URL로 데이터 가져오기
async function fetchValidUsers() {
    const url = "https://script.google.com/macros/s/AKfycbyCrewjcnY3AbPE5vhv5_flwxlQMucC49Nu9GRxH1yQWQS62BIAQJ09JJmQULVIJ9-Bfw/exec"; // Google Apps Script URL을 입력하세요.

    try {
        const response = await fetch(url);
        const validUsers = await response.json();
        return validUsers;
    } catch (error) {
        console.error("사용자 데이터 가져오기 실패:", error);
        return null;
    }
}

function sendLogData(eventId, userId, eventType, comment) {
    const url = "https://script.google.com/macros/s/AKfycbyCrewjcnY3AbPE5vhv5_flwxlQMucC49Nu9GRxH1yQWQS62BIAQJ09JJmQULVIJ9-Bfw/exec"; // Google Apps Script URL

    const logData = {
        eventId: eventId,
        userId: userId,
        eventType: eventType,
        comment: comment
    };

    fetch(url, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify(logData),
        mode: "no-cors"
    })
    .then(response => response.text())
    .then(data => console.log("로그 전송 성공:", data))
    .catch(error => console.error("로그 전송 실패:", error));
}

async function handleLogin(event) {
    event.preventDefault(); // 기본 폼 제출을 방지

    const studentId = document.getElementById("studentId").value; // 학번 가져오기
    const studentName = document.getElementById("studentName").value; // 이름 가져오기

    const validUsers = await fetchValidUsers(); // Google Sheets에서 사용자 데이터 가져오기

    if (validUsers && validUsers[studentId] === studentName) { // 사용자 검사
        alert("으라차차 농산물시장에 오신걸 환영합니다!");

        // 로그인 성공 로그 전송
        const eventId = Date.now(); // 유일한 ID로 현재 시간 밀리초 사용
        sendLogData(eventId, studentId, "로그인", `로그인 성공: ${studentName}`);

        // localStorage에 사용자 ID 저장
        localStorage.setItem("studentId", studentId);

        // 페이지 리디렉션
        window.location.href = "title.html"; // 타이틀 화면으로 리디렉션
    } else {
        alert("학번 또는 이름이 올바르지 않습니다. 다시 입력해주세요.");
    }
}

// DOMContentLoaded 이벤트가 발생한 후 코드 실행
document.addEventListener("DOMContentLoaded", function() {
    // 로그인 폼의 submit 이벤트에 handleLogin 함수 연결
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
});
