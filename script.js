/* =========================================================
   ABSENSI HARIAN
   SCRIPT.JS
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_MEMBERS = "absensi_members_v1";
const STORAGE_ATTENDANCE = "absensi_attendance_v1";


/* =========================================================
   DEFAULT MEMBERS
   ========================================================= */

const defaultMembers = [
    {
        id: "member_1",
        name: "Rivano"
    }
];


/* =========================================================
   DATA
   ========================================================= */

let members = loadData(STORAGE_MEMBERS, defaultMembers);
let attendance = loadData(STORAGE_ATTENDANCE, []);

let currentPage = "dashboard";


/* =========================================================
   DOM
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();

    initializeAttendanceForm();

    initializeMemberForm();

    initializeMemberModal();

    initializeFilters();

    initializeExport();

    initializeToast();

    updateDate();

    updateClock();

    renderAll();

    setTimeout(() => {

        const loading = $("#loadingScreen");

        if (loading) {
            loading.classList.add("hide");
        }

    }, 500);

});


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadData(key, fallback) {

    try {

        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed = JSON.parse(data);

        return parsed;

    } catch (error) {

        console.error("Gagal membaca storage:", error);

        return fallback;
    }
}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error("Gagal menyimpan data:", error);

        showToast(
            "Error",
            "Data gagal disimpan.",
            "error"
        );
    }
}


/* =========================================================
   DATE
   ========================================================= */

function getToday() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


function formatShortDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function getCurrentMonthName() {

    return new Date().toLocaleDateString(
        "id-ID",
        {
            month: "long",
            year: "numeric"
        }
    );
}


function updateDate() {

    const today = formatDate(
        getToday()
    );

    if ($("#currentDate")) {
        $("#currentDate").textContent = today;
    }

    if ($("#attendanceDate")) {
        $("#attendanceDate").textContent = today;
    }

    if ($("#monthName")) {
        $("#monthName").textContent =
            getCurrentMonthName();
    }
}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    const clock = $("#clock");

    if (!clock) {
        return;
    }

    const now = new Date();

    const hours = String(
        now.getHours()
    ).padStart(2, "0");

    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
        now.getSeconds()
    ).padStart(2, "0");

    clock.textContent =
        `${hours}:${minutes}:${seconds}`;
}


setInterval(updateClock, 1000);


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    $$(".nav-item").forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const page =
                    item.dataset.page;

                showPage(page);

                closeSidebar();

            }
        );

    });


    const menuButton = $("#menuButton");

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                const sidebar =
                    $("#sidebar");

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }

}


function showPage(pageName) {

    currentPage = pageName;

    $$(".page").forEach(page => {

        page.classList.remove("active");

    });


    const target =
        $(`#${pageName}`);

    if (target) {
        target.classList.add("active");
    }


    $$(".nav-item").forEach(item => {

        item.classList.remove("active");

        if (
            item.dataset.page === pageName
        ) {

            item.classList.add("active");

        }

    });


    const titles = {

        dashboard: "Dashboard",

        absensi: "Absensi",

        rekap: "Rekap Absensi",

        anggota: "Data Anggota"

    };


    if ($("#pageTitle")) {

        $("#pageTitle").textContent =
            titles[pageName] ||
            "Dashboard";

    }


    if (pageName === "dashboard") {

        renderDashboard();

    }

    if (pageName === "absensi") {

        renderTodayList();

        renderMemberSelect();

    }

    if (pageName === "rekap") {

        renderRecap();

    }

    if (pageName === "anggota") {

        renderMembers();

    }


    window.location.hash =
        pageName;
}


function closeSidebar() {

    const sidebar = $("#sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

}


/* =========================================================
   ATTENDANCE FORM
   ========================================================= */

function initializeAttendanceForm() {

    const form =
        $("#attendanceForm");

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveAttendance();

        }
    );

}


/* =========================================================
   SAVE ATTENDANCE
   ========================================================= */

function saveAttendance() {

    const memberId =
        $("#memberSelect").value;

    const statusInput =
        document.querySelector(
            'input[name="status"]:checked'
        );

    const note =
        $("#note").value.trim();


    if (!memberId) {

        showToast(
            "Perhatian",
            "Silakan pilih anggota.",
            "error"
        );

        return;
    }


    if (!statusInput) {

        showToast(
            "Perhatian",
            "Silakan pilih status kehadiran.",
            "error"
        );

        return;
    }


    const status =
        statusInput.value;

    const today =
        getToday();


    const alreadyExists =
        attendance.some(item =>

            item.memberId === memberId &&
            item.date === today

        );


    if (alreadyExists) {

        showToast(
            "Sudah Absen",
            "Anggota tersebut sudah melakukan absensi hari ini.",
            "error"
        );

        return;
    }


    const now = new Date();

    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    const newAttendance = {

        id:
            "attendance_" +
            Date.now(),

        memberId,

        status,

        date: today,

        time,

        note

    };


    attendance.push(
        newAttendance
    );


    saveData(
        STORAGE_ATTENDANCE,
        attendance
    );


    $("#attendanceForm").reset();


    renderAll();


    showToast(
        "Berhasil",
        "Absensi berhasil disimpan."
    );

}


/* =========================================================
   MEMBER SELECT
   ========================================================= */

function renderMemberSelect() {

    const select =
        $("#memberSelect");

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            -- Pilih Anggota --
        </option>
    `;


    members.forEach(member => {

        const option =
            document.createElement("option");

        option.value =
            member.id;

        option.textContent =
            member.name;

        select.appendChild(option);

    });


    if (
        members.some(
            member =>
                member.id === currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   TODAY LIST
   ========================================================= */

function renderTodayList() {

    const container =
        $("#todayList");

    if (!container) {
        return;
    }


    const today =
        getToday();


    const todayData =
        attendance
            .filter(item =>
                item.date === today
            )
            .sort(
                (a, b) =>
                    b.time.localeCompare(
                        a.time
                    )
            );


    if (todayData.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>

                <h3>Belum ada absensi</h3>

                <p>
                    Data absensi hari ini akan muncul di sini.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        todayData.map(item => {

            const member =
                getMember(item.memberId);

            if (!member) {
                return "";
            }


            return `
                <div class="today-item">

                    <div class="today-member">

                        <div class="avatar">
                            ${getInitial(member.name)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(member.name)}
                            </strong>

                            <small>
                                ${item.time}
                            </small>

                        </div>

                    </div>


                    <span class="status-badge ${getStatusClass(item.status)}">
                        ${escapeHTML(item.status)}
                    </span>

                </div>
            `;

        }).join("");

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    const today =
        getToday();


    const todayData =
        attendance.filter(
            item =>
                item.date === today
        );


    setText(
        "#todayPresent",
        countStatus(
            todayData,
            "Hadir"
        )
    );

    setText(
        "#todayPermission",
        countStatus(
            todayData,
            "Izin"
        )
    );

    setText(
        "#todaySick",
        countStatus(
            todayData,
            "Sakit"
        )
    );

    setText(
        "#todayAbsent",
        countStatus(
            todayData,
            "Alpa"
        )
    );


    const weekData =
        getWeekData();


    const weekPresent =
        countStatus(
            weekData,
            "Hadir"
        );


    const weekTotal =
        weekData.length;


    setText(
        "#weekPresent",
        weekPresent
    );


    const weekPercentage =
        calculatePercentage(
            weekPresent,
            weekTotal
        );


    setText(
        "#weekPercentage",
        `${weekPercentage}%`
    );


    setWidth(
        "#weekProgress",
        weekPercentage
    );


    const monthData =
        getMonthData();


    const monthPresent =
        countStatus(
            monthData,
            "Hadir"
        );


    const monthTotal =
        monthData.length;


    setText(
        "#monthPresent",
        monthPresent
    );


    const monthPercentage =
        calculatePercentage(
            monthPresent,
            monthTotal
        );


    setText(
        "#monthPercentage",
        `${monthPercentage}%`
    );


    setWidth(
        "#monthProgress",
        monthPercentage
    );


    renderRecentAttendance();

}


/* =========================================================
   RECENT ATTENDANCE
   ========================================================= */

function renderRecentAttendance() {

    const tbody =
        $("#recentAttendance");

    if (!tbody) {
        return;
    }


    const data =
        [...attendance]
            .sort(
                (a, b) =>
                    `${b.date}${b.time}`.localeCompare(
                        `${a.date}${a.time}`
                    )
            )
            .slice(0, 10);


    if (data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    Belum ada data absensi.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        data.map(item => {

            const member =
                getMember(item.memberId);

            if (!member) {
                return "";
            }


            return `
                <tr>

                    <td>
                        ${formatShortDate(item.date)}
                    </td>

                    <td>
                        ${escapeHTML(member.name)}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(item.status)}">
                            ${escapeHTML(item.status)}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(item.time)}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   RECAP
   ========================================================= */

function initializeFilters() {

    const period =
        $("#periodFilter");

    const member =
        $("#memberFilter");


    if (period) {

        period.addEventListener(
            "change",
            renderRecap
        );

    }


    if (member) {

        member.addEventListener(
            "change",
            renderRecap
        );

    }

}


function renderRecap() {

    renderMemberFilter();


    const period =
        $("#periodFilter")
            ?.value || "week";


    const memberId =
        $("#memberFilter")
            ?.value || "all";


    let data;


    if (period === "week") {

        data =
            getWeekData();

    } else if (period === "month") {

        data =
            getMonthData();

    } else {

        data =
            [...attendance];

    }


    if (memberId !== "all") {

        data =
            data.filter(
                item =>
                    item.memberId === memberId
            );

    }


    const present =
        countStatus(
            data,
            "Hadir"
        );

    const permission =
        countStatus(
            data,
            "Izin"
        );

    const sick =
        countStatus(
            data,
            "Sakit"
        );

    const absent =
        countStatus(
            data,
            "Alpa"
        );


    setText(
        "#recapPresent",
        present
    );

    setText(
        "#recapPermission",
        permission
    );

    setText(
        "#recapSick",
        sick
    );

    setText(
        "#recapAbsent",
        absent
    );


    const percentage =
        calculatePercentage(
            present,
            data.length
        );


    setText(
        "#recapPercentage",
        `${percentage}%`
    );


    renderRecapTable(data);

}


/* =========================================================
   MEMBER FILTER
   ========================================================= */

function renderMemberFilter() {

    const select =
        $("#memberFilter");

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="all">
            Semua Anggota
        </option>
    `;


    members.forEach(member => {

        const option =
            document.createElement("option");

        option.value =
            member.id;

        option.textContent =
            member.name;

        select.appendChild(option);

    });


    if (
        currentValue === "all" ||
        members.some(
            member =>
                member.id === currentValue
        )
    ) {

        select.value =
            currentValue || "all";

    }

}


/* =========================================================
   RECAP TABLE
   ========================================================= */

function renderRecapTable(data) {

    const tbody =
        $("#recapTable");

    if (!tbody) {
        return;
    }


    const sorted =
        [...data].sort(
            (a, b) =>
                `${b.date}${b.time}`.localeCompare(
                    `${a.date}${a.time}`
                )
        );


    if (sorted.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Tidak ada data pada periode ini.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        sorted.map(item => {

            const member =
                getMember(item.memberId);

            if (!member) {
                return "";
            }


            return `
                <tr>

                    <td>
                        ${formatShortDate(item.date)}
                    </td>

                    <td>
                        ${escapeHTML(member.name)}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(item.status)}">
                            ${escapeHTML(item.status)}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(item.time)}
                    </td>

                    <td>
                        ${item.note
                            ? escapeHTML(item.note)
                            : "-"
                   
