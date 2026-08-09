"use strict";

/* =========================================================
   ABSEN 577
   SCRIPT.JS — FINAL
========================================================= */

const STORAGE_MEMBERS = "absen577_members_v3";
const STORAGE_ATTENDANCE = "absen577_attendance_v3";

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_MEMBERS = [
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
    DEFAULT_MEMBERS
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

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();
    initializeAttendanceForm();
    initializeMemberForm();
    initializeFilters();
    initializeExport();
    initializeModal();
    initializeMobileMenu();

    updateDate();
    updateClock();
    renderAll();

    setInterval(updateClock, 1000);

    setTimeout(() => {
        const loading = $("#loadingScreen");

        if (loading) {
            loading.classList.add("hide");
        }
    }, 500);
});


/* =========================================================
   STORAGE
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

        console.error(
            "Gagal membaca data:",
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

        return true;

    } catch (error) {

        console.error(
            "Gagal menyimpan data:",
            error
        );

        showToast(
            "Gagal menyimpan data.",
            "error"
        );

        return false;
    }
}


/* =========================================================
   DATE & TIME
========================================================= */

function getToday() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getMonthKey(dateString) {

    return dateString.slice(0, 7);
}


function getWeekStart(dateString) {

    const date = new Date(
        dateString + "T00:00:00"
    );

    const day = date.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

    date.setDate(
        date.getDate() + difference
    );

    return formatDateISO(date);
}


function formatDateISO(date) {

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


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
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


function updateDate() {

    const today =
        new Date();

    const dateText =
        today.toLocaleDateString(
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
        "#dashboardDate",
        "#attendanceDate"
    ];

    elements.forEach(selector => {

        const element =
            $(selector);

        if (element) {
            element.textContent =
                dateText;
        }
    });
}


function updateClock() {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    const clock =
        $("#clock");

    if (clock) {
        clock.textContent =
            time;
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

                if (!page) {
                    return;
                }

                showPage(page);

                closeMobileMenu();
            }
        );
    });
}


function showPage(pageName) {

    currentPage =
        pageName;

    $$(".page").forEach(page => {

        page.classList.remove(
            "active"
        );
    });

    const target =
        $(`#${pageName}`);

    if (target) {
        target.classList.add(
            "active"
        );
    }

    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    renderAll();
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


function populateMemberSelect() {

    const select =
        $("#memberSelect");

    if (!select) {
        return;
    }

    const currentValue =
        select.value;

    select.innerHTML =
        `<option value="">
            Pilih anggota
        </option>`;

    members.forEach(member => {

        const option =
            document.createElement("option");

        option.value =
            member.id;

        option.textContent =
            member.name;

        select.appendChild(
            option
        );
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


function getSelectedStatus() {

    const checked =
        document.querySelector(
            'input[name="status"]:checked'
        );

    return checked
        ? checked.value
        : "";
}


function saveAttendance() {

    const memberSelect =
        $("#memberSelect");

    const dateInput =
        $("#attendanceDate");

    const noteInput =
        $("#attendanceNote");

    const memberId =
        memberSelect
            ? memberSelect.value
            : "";

    const date =
        dateInput &&
        dateInput.value
            ? dateInput.value
            : getToday();

    const status =
        getSelectedStatus();

    const note =
        noteInput
            ? noteInput.value.trim()
            : "";

    if (!memberId) {

        showToast(
            "Silakan pilih anggota.",
            "error"
        );

        return;
    }

    if (!status) {

        showToast(
            "Silakan pilih status kehadiran.",
            "error"
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
            "Anggota tidak ditemukan.",
            "error"
        );

        return;
    }

    /*
       Satu anggota hanya boleh punya
       satu absensi pada tanggal yang sama.
    */

    const existingIndex =
        attendance.findIndex(item =>
            item.memberId === memberId &&
            item.date === date
        );

    const record = {

        id:
            existingIndex >= 0
                ? attendance[existingIndex].id
                : generateId(),

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

        attendance[
            existingIndex
        ] = record;

        showToast(
            `Absensi ${member.name} diperbarui.`,
            "success"
        );

    } else {

        attendance.push(
            record
        );

        showToast(
            `Absensi ${member.name} berhasil disimpan.`,
            "success"
        );
    }

    saveData(
        STORAGE_ATTENDANCE,
        attendance
    );

    renderAll();

    formResetAttendance();
}


function formResetAttendance() {

    const form =
        $("#attendanceForm");

    if (!form) {
        return;
    }

    const dateInput =
        $("#attendanceDate");

    form.reset();

    if (dateInput) {
        dateInput.value =
            getToday();
    }
}


/* =========================================================
   MEMBER
========================================================= */

function initializeMemberForm() {

    const form =
        $("#memberForm");

    if (!form) {
        return;
    }

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

    if (!input) {
        return;
    }

    const name =
        input.value.trim();

    if (!name) {

        showToast(
            "Nama anggota wajib diisi.",
            "error"
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
            "Nama anggota sudah ada.",
            "error"
        );

        return;
    }

    const member = {

        id:
            generateId(),

        name
    };

    members.push(
        member
    );

    saveData(
        STORAGE_MEMBERS,
        members
    );

    input.value = "";

    populateMemberSelect();
    renderMembers();
    updateStatistics();

    showToast(
        `${name} berhasil ditambahkan.`,
        "success"
    );
}


function deleteMember(memberId) {

    const member =
        members.find(
            item =>
                item.id === memberId
        );

    if (!member) {
        return;
    }

    const confirmed =
        confirm(
            `Hapus anggota "${member.name}"?`
        );

    if (!confirmed) {
        return;
    }

    members =
        members.filter(
            item =>
                item.id !== memberId
        );

    /*
       Hapus juga seluruh data absensinya.
    */

    attendance =
        attendance.filter(
            item =>
                item.memberId !== memberId
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
        `${member.name} berhasil dihapus.`,
        "success"
    );
}


function renderMembers() {

    const tbody =
        $("#membersTableBody");

    if (!tbody) {
        return;
    }

    if (!members.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div>👥</div>
                        <h3>Belum ada anggota</h3>
                        <p>
                            Tambahkan anggota terlebih dahulu.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        members.map(
            (member, index) => {

                const total =
                    attendance.filter(
                        item =>
                            item.memberId ===
                            member.id
                    ).length;

                return `
                    <tr>
                        <td>${index + 1}</td>

                        <td>
                            <strong>
                                ${escapeHTML(member.name)}
                            </strong>
                        </td>

                        <td>
                            ${total}
                        </td>

                        <td>
                            <button
                                class="action-button"
                                type="button"
                                onclick="deleteMember('${member.id}')"
                                title="Hapus"
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }
        ).join("");
}


/* =========================================================
   ATTENDANCE TABLE
========================================================= */

function renderAttendanceTable(
    list = attendance
) {

    const tbody =
        $("#attendanceTableBody");

    if (!tbody) {
        return;
    }

    if (!list.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div>📋</div>
                        <h3>Belum ada absensi</h3>
                        <p>
                            Data kehadiran akan muncul
                            setelah melakukan absensi.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    const sorted =
        [...list].sort(
            (a, b) => {

                if (a.date === b.date) {
                    return (
                        a.memberName || ""
                    ).localeCompare(
                        b.memberName || ""
                    );
                }

                return b.date.localeCompare(
                    a.date
                );
            }
        );

    tbody.innerHTML =
        sorted.map(
            (item, index) => {

                return `
                    <tr>
                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    item.memberName
                                )}
                            </strong>
                        </td>

                        <td>
                            ${formatDate(
                                item.date
                            )}
                        </td>

                        <td>
                            <span
                                class="status-badge ${item.status}"
                            >
                                ${statusLabel(
                                    item.status
                                )}
                            </span>
                        </td>

                        <td>
                            ${escapeHTML(
                                item.note || "-"
                            )}
                        </td>

                        <td>
                            <button
                                class="action-button"
                                type="button"
                                onclick="deleteAttendance('${item.id}')"
                                title="Hapus absensi"
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }
        ).join("");
}


function deleteAttendance(id) {

    const record =
        attendance.find(
            item =>
                item.id === id
        );

    if (!record) {
        return;
    }

    const confirmed =
        confirm(
            `Hapus absensi ${record.memberName} pada ${formatDate(record.date)}?`
        );

    if (!confirmed) {
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
        "Data absensi berhasil dihapus.",
        "success"
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateStatistics() {

    const today =
        getToday();

    const weekStart =
        getWeekStart(today);

    const month =
        getMonthKey(today);

    const todayData =
        attendance.filter(
            item =>
                item.date === today
        );

    const weekData =
        attendance.filter(
            item =>
                item.date >= weekStart &&
                item.date <= today
        );

    const monthData =
        attendance.filter(
            item =>
                getMonthKey(item.date) ===
                month
        );

    const counts =
        countStatuses(todayData);

    setText(
        "#todayHadir",
        counts.hadir
    );

    setText(
        "#todayIzin",
        counts.izin
    );

    setText(
        "#todaySakit",
        counts.sakit
    );

    setText(
        "#todayAlpa",
        counts.alpa
    );


    setText(
        "#weekTotal",
        weekData.length
    );

    setText(
        "#monthTotal",
        monthData.length
    );


    const totalToday =
        todayData.length;

    const percentage =
        totalToday === 0
            ? 0
            : Math.round(
                (
                    counts.hadir /
                    totalToday
                ) * 100
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
}


function countStatuses(data) {

    return {

        hadir:
            data.filter(
                item =>
                    item.status === "hadir"
            ).length,

        izin:
            data.filter(
                item =>
                    item.status === "izin"
            ).length,

        sakit:
            data.filter(
                item =>
                    item.status === "sakit"
            ).length,

        alpa:
            data.filter(
                item =>
                    item.status === "alpa"
            ).length
    };
}


function renderTodayAttendance() {

    const container =
        $("#todayAttendanceList");

    if (!container) {
        return;
    }

    const today =
        getToday();

    const todayData =
        attendance
            .filter(
                item =>
                    item.date === today
            )
            .sort(
                (a, b) =>
                    (a.memberName || "")
                        .localeCompare(
                            b.memberName || ""
                        )
            );

    if (!todayData.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h3>Belum ada absensi</h3>
                <p>
                    Belum ada data kehadiran hari ini.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        todayData.map(item => {

            return `
                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:12px;
                        padding:14px 20px;
                        border-bottom:1px solid var(--border);
                    "
                >
                    <div>
                        <strong>
                            ${escapeHTML(
                                item.memberName
                            )}
                        </strong>

                        <div
                            style="
                                margin-top:4px;
                                color:var(--text-muted);
                                font-size:11px;
                            "
                        >
                            ${escapeHTML(
                                item.note || "Tidak ada catatan"
                            )}
                        </div>
                    </div>

                    <span
                        class="status-badge ${item.status}"
                    >
                        ${statusLabel(
                            item.status
                        )}
                    </span>
                </div>
            `;
        }).join("");
}


/* =========================================================
   FILTER
========================================================= */

function initializeFilters() {

    const search =
        $("#searchAttendance");

    const dateFilter =
        $("#filterDate");

    if (search) {

        search.addEventListener(
            "input",
            filterAttendance
        );
    }

    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            filterAttendance
        );
    }
}


function filterAttendance() {

    const search =
        $("#searchAttendance");

    const dateFilter =
        $("#filterDate");

    const keyword =
        search
            ? search.value
                .trim()
                .toLowerCase()
            : "";

    const selectedDate =
        dateFilter
            ? dateFilter.value
            : "";

    const result =
        attendance.filter(item => {

            const matchesName =
                !keyword ||
                (
                    item.memberName || ""
                )
                    .toLowerCase()
                    .includes(keyword);

            const matchesDate =
                !selectedDate ||
                item.date === selectedDate;

            return (
                matchesName &&
                matchesDate
            );
        });

    renderAttendanceTable(
        result
    );
}


/* =========================================================
   EXPORT CSV
========================================================= */

function initializeExport() {

    const button =
        $("#exportButton");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        exportCSV
    );
}


function exportCSV() {

    if (!attendance.length) {

        showToast(
            "Belum ada data untuk diekspor.",
            "error"
        );

        return;
    }

    const headers = [
        "Nama",
        "Tanggal",
        "Status",
        "Catatan"
    ];

    const rows =
        attendance.map(item => [

            item.memberName,

            item.date,

            statusLabel(
                item.status
            ),

            item.note || ""
        ]);


    const csv = [

        headers,

        ...rows

    ].map(row =>

        row.map(value => {

            const text =
                String(
                    value ?? ""
                );

            return `"${text.replace(
                /"/g,
                '""'
            )}"`;

        }).join(",")

    ).join("\n");


    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        `absen-577-${getToday()}.csv`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Data berhasil diekspor.",
        "success"
    );
}


/* =========================================================
   MODAL
========================================================= */

function initializeModal() {

    const modal =
        $("#memberModal");

    const openButton =
        $("#openMemberModal");

    const closeButton =
        $("#closeMemberModal");

    if (openButton) {

        openButton.addEventListener(
            "click",
            () => {

                if (modal) {
                    modal.classList.add(
                        "show"
                    );
                }
            }
        );
    }

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMemberModal
        );
    }

    if (modal) {

        modal.addEventListener(
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
}


function closeMemberModal() {

    const modal =
        $("#memberModal");

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const button =
        $("#menuButton");

    const sidebar =
        $(".sidebar");

    const overlay =
        $("#sidebarOverlay");

    if (button) {

        button.addEventListener(
            "click",
            () => {

                if (!sidebar) {
                    return;
                }

                sidebar.classList.toggle(
                    "open"
                );

                if (overlay) {

                    overlay.classList.toggle(
                        "show"
                    );
                }
            }
        );
    }

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileMenu
        );
    }
}


function closeMobileMenu() {

    const sidebar =
        $(".sidebar");

    const overlay =
        $("#sidebarOverlay");

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );
    }

    if (overlay) {

        overlay.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    populateMemberSelect();

    renderMembers();

    renderAttendanceTable();

    renderTodayAttendance();

    updateStatistics();

    setDefaultDate();
}


function setDefaultDate() {

    const dateInput =
        $("#attendanceDate");

    if (
        dateInput &&
        !dateInput.value
    ) {
        dateInput.value =
            getToday();
    }
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("#toast");

    const text =
        $("#toastMessage");

    const icon =
        $("#toastIcon");

    if (!toast) {
        return;
    }

    if (text) {
        text.textContent =
            message;
    }

    if (icon) {

        icon.textContent =
            type === "error"
                ? "!"
                : "✓";

        icon.style.color =
            type === "error"
                ? "#fca5a5"
                : "#86efac";
    }

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


function closeToast() {

    const toast =
        $("#toast");

    if (toast) {

        toast.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   UTILITIES
========================================================= */

function generateId() {

    return (
        "id_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
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
        status ||
        "-"
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


function escapeHTML(value) {

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
   Supaya onclick dari HTML tetap bekerja.
========================================================= */

window.deleteMember =
    deleteMember;

window.deleteAttendance =
    deleteAttendance;

window.closeToast =
    closeToast;

window.closeMemberModal =
    closeMemberModal;

window.showPage =
    showPage;
