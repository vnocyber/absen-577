"use strict";

/* =========================================================
   ABSEN 577 — SCRIPT.JS
   Penyimpanan: LocalStorage
   Fitur:
   - Absensi harian
   - Rekap mingguan
   - Rekap bulanan
   - Data anggota
   - Tambah/hapus anggota
   - Filter tanggal
   - Export CSV
   - Dashboard
   - Responsive mobile
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_MEMBERS = "absen577_members_v3";
const STORAGE_ATTENDANCE = "absen577_attendance_v3";


/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultMembers = [
    {
        id: "member_1",
        name: "Rivano"
    }
];


/* =========================================================
   STATE
========================================================= */

let members = loadData(
    STORAGE_MEMBERS,
    defaultMembers
);

let attendance = loadData(
    STORAGE_ATTENDANCE,
    []
);

let currentPage = "dashboard";


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNavigation();

        initializeMobileMenu();

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

            const loading =
                $("#loadingScreen");

            if (loading) {
                loading.classList.add("hide");
            }

        }, 500);

    }
);


/* =========================================================
   STORAGE FUNCTIONS
========================================================= */

function loadData(key, fallback) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed =
            JSON.parse(data);

        return parsed;

    } catch (error) {

        console.error(
            "Gagal membaca storage:",
            error
        );

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

        console.error(
            "Gagal menyimpan data:",
            error
        );

        showToast(
            "Gagal",
            "Data tidak dapat disimpan."
        );
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                if (!page) return;

                openPage(page);

                closeSidebar();

            }
        );

    });

}


function openPage(page) {

    currentPage = page;

    $$(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
        );

    });


    $$(".page").forEach(section => {

        section.classList.toggle(
            "active",
            section.id === `page-${page}`
        );

    });


    const titleMap = {

        dashboard: "Dashboard",

        attendance: "Absensi Harian",

        weekly: "Rekap Mingguan",

        monthly: "Rekap Bulanan",

        members: "Data Anggota"

    };


    const subtitleMap = {

        dashboard:
            "Pantau kehadiran anggota dengan mudah.",

        attendance:
            "Catat kehadiran anggota hari ini.",

        weekly:
            "Lihat total kehadiran dalam satu minggu.",

        monthly:
            "Lihat total kehadiran dalam satu bulan.",

        members:
            "Kelola daftar anggota absensi."

    };


    const title =
        $("#topbarTitle");

    const subtitle =
        $("#topbarSubtitle");


    if (title) {

        title.textContent =
            titleMap[page] ||
            "Absensi 577";

    }


    if (subtitle) {

        subtitle.textContent =
            subtitleMap[page] ||
            "";

    }


    if (page === "dashboard") {

        renderDashboard();

    }

    if (page === "attendance") {

        renderAttendancePage();

    }

    if (page === "weekly") {

        renderWeekly();

    }

    if (page === "monthly") {

        renderMonthly();

    }

    if (page === "members") {

        renderMembers();

    }

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const menuButton =
        $("#menuButton");

    const sidebar =
        $(".sidebar");

    const overlay =
        $(".sidebar-overlay");


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                sidebar?.classList.add("open");

                overlay?.classList.add("show");

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }

}


function closeSidebar() {

    $(".sidebar")?.classList.remove(
        "open"
    );

    $(".sidebar-overlay")?.classList.remove(
        "show"
    );

}


/* =========================================================
   DATE & CLOCK
========================================================= */

function updateDate() {

    const now =
        new Date();

    const formatted =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const elements = [
        "#currentDate",
        "#todayDate",
        "#attendanceDate"
    ];


    elements.forEach(selector => {

        const element =
            $(selector);

        if (element) {

            if (
                element.tagName ===
                "INPUT"
            ) {

                element.value =
                    getLocalDate();

            } else {

                element.textContent =
                    formatted;

            }

        }

    });

}


function updateClock() {

    const clock =
        $("#clock");

    if (!clock) return;


    function tick() {

        const now =
            new Date();

        clock.textContent =
            now.toLocaleTimeString(
                "id-ID",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

    }


    tick();

    setInterval(
        tick,
        1000
    );

}


function getLocalDate(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/* =========================================================
   ATTENDANCE FORM
========================================================= */

function initializeAttendanceForm() {

    const form =
        $("#attendanceForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveAttendance();

        }
    );


    const dateInput =
        $("#attendanceDate");

    if (dateInput) {

        dateInput.value =
            getLocalDate();

    }


    populateMemberSelect();

}


function populateMemberSelect() {

    const select =
        $("#attendanceMember");

    if (!select) return;


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Pilih anggota
        </option>
    `;


    members.forEach(member => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            member.id;

        option.textContent =
            member.name;

        select.appendChild(
            option
        );

    });


    if (currentValue) {

        select.value =
            currentValue;

    }

}


function saveAttendance() {

    const memberSelect =
        $("#attendanceMember");

    const dateInput =
        $("#attendanceDate");

    const noteInput =
        $("#attendanceNote");


    const memberId =
        memberSelect?.value;

    const date =
        dateInput?.value ||
        getLocalDate();

    const note =
        noteInput?.value.trim() ||
        "";


    const statusInput =
        document.querySelector(
            'input[name="status"]:checked'
        );


    const status =
        statusInput?.value;


    if (!memberId) {

        showToast(
            "Perhatian",
            "Silakan pilih anggota terlebih dahulu."
        );

        return;
    }


    if (!status) {

        showToast(
            "Perhatian",
            "Silakan pilih status kehadiran."
        );

        return;
    }


    const member =
        members.find(
            item =>
                item.id === memberId
        );


    if (!member) {

        showToast(
            "Gagal",
            "Anggota tidak ditemukan."
        );

        return;
    }


    const existingIndex =
        attendance.findIndex(
            item =>
                item.memberId === memberId &&
                item.date === date
        );


    const record = {

        id:
            existingIndex >= 0
                ? attendance[existingIndex].id
                : createId(),

        memberId,

        memberName:
            member.name,

        date,

        status,

        note,

        createdAt:
            new Date().toISOString()

    };


    if (existingIndex >= 0) {

        attendance[existingIndex] =
            record;

        showToast(
            "Diperbarui",
            `${member.name} berhasil diperbarui.`
        );

    } else {

        attendance.push(record);

        showToast(
            "Berhasil",
            `${member.name} berhasil diabsen.`
        );

    }


    saveData(
        STORAGE_ATTENDANCE,
        attendance
    );


    renderAll();


    if (formResetSafe()) {

        $("#attendanceForm").reset();

        if ($("#attendanceDate")) {

            $("#attendanceDate").value =
                getLocalDate();

        }

    }

}


/* =========================================================
   MEMBER FORM
========================================================= */

function initializeMemberForm() {

    const form =
        $("#memberForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            addMember();

        }
    );

}


function addMember() {

    const input =
        $("#memberName");

    if (!input) return;


    const name =
        input.value.trim();


    if (!name) {

        showToast(
            "Perhatian",
            "Nama anggota belum diisi."
        );

        return;

    }


    const duplicate =
        members.some(
            member =>
                member.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (duplicate) {

        showToast(
            "Perhatian",
            "Nama anggota sudah ada."
        );

        return;

    }


    const member = {

        id:
            createId(),

        name

    };


    members.push(member);


    saveData(
        STORAGE_MEMBERS,
        members
    );


    input.value = "";


    populateMemberSelect();

    renderAll();


    closeMemberModal();


    showToast(
        "Berhasil",
        `${name} berhasil ditambahkan.`
    );

}


/* =========================================================
   MEMBER MODAL
========================================================= */

function initializeMemberModal() {

    const addButton =
        $("#addMemberButton");

    const modal =
        $("#memberModal");

    const closeButton =
        $("#closeMemberModal");


    addButton?.addEventListener(
        "click",
        () => {

            modal?.classList.add("show");

            setTimeout(
                () =>
                    $("#memberName")?.focus(),
                100
            );

        }
    );


    closeButton?.addEventListener(
        "click",
        closeMemberModal
    );


    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeMemberModal();

            }

        }
    );

}


function closeMemberModal() {

    $("#memberModal")?.classList.remove(
        "show"
    );

}


/* =========================================================
   DELETE MEMBER
========================================================= */

function deleteMember(id) {

    const member =
        members.find(
            item =>
                item.id === id
        );


    if (!member) return;


    const confirmed =
        confirm(
            `Hapus anggota "${member.name}"?\n\nData absensi anggota juga akan dihapus.`
        );


    if (!confirmed) return;


    members =
        members.filter(
            item =>
                item.id !== id
        );


    attendance =
        attendance.filter(
            item =>
                item.memberId !== id
        );


    saveData(
        STORAGE_MEMBERS,
        members
    );


    saveData(
        STORAGE_ATTENDANCE,
        attendance
    );


    populateMemberSelect();

    renderAll();


    showToast(
        "Berhasil",
        `${member.name} telah dihapus.`
    );

}


/* =========================================================
   FILTER
========================================================= */

function initializeFilters() {

    const dateFilter =
        $("#filterDate");

    const monthFilter =
        $("#filterMonth");


    dateFilter?.addEventListener(
        "change",
        () => {

            renderAttendancePage();

        }
    );


    monthFilter?.addEventListener(
        "change",
        () => {

            renderMonthly();

        }
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const today =
        getLocalDate();


    const todayRecords =
        attendance.filter(
            item =>
                item.date === today
        );


    const counts =
        countStatuses(
            todayRecords
        );


    setText(
        "#totalHadir",
        counts.hadir
    );

    setText(
        "#totalIzin",
        counts.izin
    );

    setText(
        "#totalSakit",
        counts.sakit
    );

    setText(
        "#totalAlpa",
        counts.alpa
    );


    const total =
        members.length;


    const present =
        counts.hadir;


    const percentage =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;


    setText(
        "#weeklyTotal",
        getPeriodTotal(7)
    );


    setText(
        "#monthlyTotal",
        getMonthlyTotal()
    );


    setText(
        "#attendancePercentage",
        `${percentage}%`
    );


    const progress =
        $("#attendanceProgress");


    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }


    renderTodayList();

    renderRecentAttendance();

}


/* =========================================================
   TODAY LIST
========================================================= */

function renderTodayList() {

    const container =
        $("#todayList");

    if (!container) return;


    const today =
        getLocalDate();


    const records =
        attendance.filter(
            item =>
                item.date === today
        );


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h3>Belum ada absensi</h3>
                <p>Belum ada data kehadiran hari ini.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        records
            .map(
                record =>
                    createAttendanceItem(
                        record
                    )
            )
            .join("");

}


function createAttendanceItem(record) {

    return `
        <div class="today-item">

            <div class="today-member">

                <div class="avatar">
                    ${getInitials(record.memberName)}
                </div>

                <div>

                    <strong>
                        ${escapeHtml(record.memberName)}
                    </strong>

                    <small>
                        ${formatDate(record.date)}
                    </small>

                </div>

            </div>

            <span class="status-badge ${record.status}">
                ${statusLabel(record.status)}
            </span>

        </div>
    `;

}


/* =========================================================
   RECENT ATTENDANCE
========================================================= */

function renderRecentAttendance() {

    const container =
        $("#recentAttendance");

    if (!container) return;


    const records =
        [...attendance]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 10);


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📊</div>
                <h3>Belum ada data</h3>
                <p>Data absensi akan muncul di sini.</p>
            </div>
        `;

        return;

    }


    container.innerHTML = `
        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Nama</th>

                        <th>Tanggal</th>

                        <th>Status</th>

                        <th>Keterangan</th>

                    </tr>

                </thead>

                <tbody>

                    ${records.map(record => `

                        <tr>

                            <td>
                                ${escapeHtml(record.memberName)}
                            </td>

                            <td>
                                ${formatDate(record.date)}
                            </td>

                            <td>
                                <span class="status-badge ${record.status}">
                                    ${statusLabel(record.status)}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(record.note || "-")}
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;

}


/* =========================================================
   ATTENDANCE PAGE
========================================================= */

function renderAttendancePage() {

    populateMemberSelect();


    const container =
        $("#attendanceTable");

    if (!container) return;


    const filter =
        $("#filterDate")?.value;


    const date =
        filter ||
        getLocalDate();


    const records =
        attendance.filter(
            item =>
                item.date === date
        );


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📅</div>
                <h3>Belum ada absensi</h3>
                <p>
                    Tidak ada data untuk
                    ${formatDate(date)}.
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML = `
        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>
                        <th>Nama</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                        <th>Aksi</th>
                    </tr>

                </thead>

                <tbody>

                    ${records.map(record => `

                        <tr>

                            <td>
                                <strong>
                                    ${escapeHtml(record.memberName)}
                                </strong>
                            </td>

                            <td>
                                <span class="status-badge ${record.status}">
                                    ${statusLabel(record.status)}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(record.note || "-")}
                            </td>

                            <td>

                                <button
                                    class="delete-button"
                                    onclick="deleteAttendance('${record.id}')"
                                >
                                    Hapus
                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;

}


/* =========================================================
   DELETE ATTENDANCE
========================================================= */

function deleteAttendance(id) {

    const record =
        attendance.find(
            item =>
                item.id === id
        );


    if (!record) return;


    if (
        !confirm(
            `Hapus data absensi ${record.memberName}?`
        )
    ) {

        return;

    }


    attendance =
        attendance.filter(
            item =>
                item.id !== id
        );


    saveData(
        STORAGE_ATTENDANCE,
        attendance
    );


    renderAll();


    showToast(
        "Berhasil",
        "Data absensi telah dihapus."
    );

}


/* =========================================================
   WEEKLY
========================================================= */

function renderWeekly() {

    const container =
        $("#weeklyTable");

    if (!container) return;


    const records =
        getRecordsLastDays(7);


    const counts =
        countStatuses(records);


    setText(
        "#weeklyHadir",
        counts.hadir
    );

    setText(
        "#weeklyIzin",
        counts.izin
    );

    setText(
        "#weeklySakit",
        counts.sakit
    );

    setText(
        "#weeklyAlpa",
        counts.alpa
    );


    renderRecapTable(
        container,
        records,
        "7 hari terakhir"
    );

}


/* =========================================================
   MONTHLY
========================================================= */

function renderMonthly() {

    const container =
        $("#monthlyTable");

    if (!container) return;


    const monthInput =
        $("#filterMonth");


    const selectedMonth =
        monthInput?.value ||
        getCurrentMonth();


    const records =
        attendance.filter(
            item =>
                item.date.startsWith(
                    selectedMonth
                )
        );


    const counts =
        countStatuses(records);


    setText(
        "#monthlyHadir",
        counts.hadir
    );

    setText(
        "#monthlyIzin",
        counts.izin
    );

    setText(
        "#monthlySakit",
        counts.sakit
    );

    setText(
        "#monthlyAlpa",
        counts.alpa
    );


    renderRecapTable(
        container,
        records,
        "Bulan terpilih"
    );

}


/* =========================================================
   RECAP TABLE
========================================================= */

function renderRecapTable(
    container,
    records,
    label
) {

    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📊</div>
                <h3>Belum ada data</h3>
                <p>
                    Belum ada data untuk
                    ${label}.
                </p>
            </div>
        `;

        return;

    }


    const grouped = {};


    records.forEach(record => {

        if (!grouped[record.memberId]) {

            grouped[record.memberId] = {

                name:
                    record.memberName,

                hadir: 0,

                izin: 0,

                sakit: 0,

                alpa: 0

            };

        }


        if (
            grouped[record.memberId][
                record.status
            ] !== undefined
        ) {

            grouped[record.memberId][
                record.status
            ]++;

        }

    });


    const rows =
        Object.values(grouped);


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Nama</th>

                        <th>Hadir</th>

                        <th>Izin</th>

                        <th>Sakit</th>

                        <th>Alpa</th>

                        <th>Total</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows.map(row => {

                        const total =
                            row.hadir +
                            row.izin +
                            row.sakit +
                            row.alpa;


                        return `

                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHtml(row.name)}
                                    </strong>
                                </td>

                                <td>
                                    <span class="status-badge hadir">
                                        ${row.hadir}
                                    </span>
                                </td>

                                <td>
                                    <span class="status-badge izin">
                                        ${row.izin}
                                    </span>
                                </td>

                                <td>
                                    <span class="status-badge sakit">
                                        ${row.sakit}
                                    </span>
                                </td>

                                <td>
                                    <span class="status-badge alpa">
                                        ${row.alpa}
                                    </span>
                                </td>

                                <td>
                                    <strong>
                                        ${total}
                                    </strong>
                                </td>

                            </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   MEMBERS
========================================================= */

function renderMembers() {

    const container =
        $("#membersTable");

    if (!container) return;


    if (!members.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>👥</div>
                <h3>Belum ada anggota</h3>
                <p>Tambahkan anggota baru.</p>
            </div>
        `;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>#</th>

                        <th>Nama</th>

                        <th>Total Absen</th>

                        <th>Hadir</th>

                        <th>Aksi</th>

                    </tr>

                </thead>

                <tbody>

                    ${members.map(
                        (member, index) => {

                            const records =
                                attendance.filter(
                                    item =>
                                        item.memberId ===
                                        member.id
                                );


                            const hadir =
                                records.filter(
                                    item =>
                                        item.status ===
                                        "hadir"
                                ).length;


                            return `

                                <tr>

                                    <td>
                                        ${index + 1}
                                    </td>

                                    <td>

                                        <div class="today-member">

                                            <div class="avatar">
                                                ${getInitials(member.name)}
                                            </div>

                                            <div>
                                                <strong>
                                                    ${escapeHtml(member.name)}
                                                </strong>
                                            </div>

                                        </div>

                                    </td>

                                    <td>
                                        ${records.length}
                                    </td>

                                    <td>
                                        ${hadir}
                                    </td>

                                    <td>

                                        <button
                                            class="delete-button"
                                            onclick="deleteMember('${member.id}')"
                                        >
                                            Hapus
                                        </button>

                                    </td>

                                </tr>

                            `;

                        }
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;


    setText(
        "#memberCount",
        members.length
    );

}


/* =========================================================
   EXPORT
========================================================= */

function initializeExport() {

    $("#exportButton")?.addEventListener(
        "click",
        exportCSV
    );

}


function exportCSV() {

    if (!attendance.length) {

        showToast(
            "Tidak ada data",
            "Belum ada data absensi untuk diekspor."
        );

        return;

    }


    const header = [

        "Tanggal",

        "Nama",

        "Status",

        "Keterangan"

    ];


    const rows =
        attendance
            .slice()
            .sort(
                (a, b) =>
                    a.date.localeCompare(
                        b.date
                    )
            )
            .map(
                item => [

                    item.date,

                    item.memberName,

                    statusLabel(
                        item.status
                    ),

                    item.note || ""

                ]
            );


    const csv = [

        header,

        ...rows

    ]

        .map(
            row =>
                row
                    .map(csvEscape)
                    .join(",")
        )

        .join("\n");


    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `absen-577-${getLocalDate()}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "Berhasil",
        "Data absensi berhasil diekspor."
    );

}


/* =========================================================
   TOAST
========================================================= */

function initializeToast() {

    $("#closeToast")?.addEventListener(
        "click",
        hideToast
    );

}


let toastTimer = null;


function showToast(
    title,
    message
) {

    const toast =
        $("#toast");

    if (!toast) return;


    setText(
        "#toastTitle",
        title
    );

    setText(
        "#toastMessage",
        message
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            hideToast,
            3500
        );

}


function hideToast() {

    $("#toast")?.classList.remove(
        "show"
    );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    updateDate();

    renderDashboard();

    renderAttendancePage();

    renderWeekly();

    renderMonthly();

    renderMembers();

}


/* =========================================================
   COUNT STATUS
========================================================= */

function countStatuses(records) {

    return {

        hadir:
            records.filter(
                item =>
                    item.status ===
                    "hadir"
            ).length,

        izin:
            records.filter(
                item =>
                    item.status ===
                    "izin"
            ).length,

        sakit:
            records.filter(
                item =>
                    item.status ===
                    "sakit"
            ).length,

        alpa:
            records.filter(
                item =>
                    item.status ===
                    "alpa"
            ).length

    };

}


/* =========================================================
   PERIOD CALCULATIONS
========================================================= */

function getRecordsLastDays(days) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const start =
        new Date(today);


    start.setDate(
        start.getDate() -
        (days - 1)
    );


    return attendance.filter(
        record => {

            const date =
                new Date(
                    `${record.date}T00:00:00`
                );


            return (
                date >= start &&
                date <= today
            );

        }
    );

}


function getPeriodTotal(days) {

    return getRecordsLastDays(
        days
    ).length;

}


function getMonthlyTotal() {

    const month =
        getCurrentMonth();


    return attendance.filter(
        item =>
            item.date.startsWith(
                month
            )
    ).length;

}


function getCurrentMonth() {

    const now =
        new Date();


    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;

}


/* =========================================================
   UTILITY
========================================================= */

function createId() {

    return (
        "id_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


function getInitials(name) {

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


function statusLabel(status) {

    const labels = {

        hadir: "Hadir",

        izin: "Izin",

        sakit: "Sakit",

        alpa: "Alpa"

    };


    return (
        labels[status] ||
        status
    );

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function setText(
    selector,
    value
) {

    const element =
        $(selector);

    if (element) {

        element.textContent =
            value;

    }

}


function formResetSafe() {

    return Boolean(
        $("#attendanceForm")
    );

}


function csvEscape(value) {

    const string =
        String(
            value ?? ""
        );


    if (
        string.includes(",") ||
        string.includes('"') ||
        string.includes("\n")
    ) {

        return `"${string.replace(
            /"/g,
            '""'
        )}"`;

    }


    return string;

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
   Dipakai oleh onclick di HTML
========================================================= */

window.openPage =
    openPage;

window.deleteMember =
    deleteMember;

window.deleteAttendance =
    deleteAttendance;

window.showToast =
    showToast;

window.closeMemberModal =
    closeMemberModal;
