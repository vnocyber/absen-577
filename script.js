"use strict";

/*
==================================================
 ABSENSI 577
 JavaScript
 Penyimpanan menggunakan localStorage
==================================================
*/

const STORAGE_MEMBERS = "absen577_members";
const STORAGE_ATTENDANCE = "absen577_attendance";

const DEFAULT_MEMBERS = [
    {
        id: "member_1",
        name: "Rivano"
    }
];


/* ==================================================
   ELEMENT HELPER
================================================== */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* ==================================================
   STORAGE
================================================== */

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed = JSON.parse(data);

        return parsed;
    } catch (error) {
        console.error("Gagal membaca data:", error);

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
        console.error("Gagal menyimpan data:", error);

        return false;
    }
}


/* ==================================================
   DATA
================================================== */

let members = loadData(
    STORAGE_MEMBERS,
    DEFAULT_MEMBERS
);

let attendance = loadData(
    STORAGE_ATTENDANCE,
    []
);


/* ==================================================
   INITIALIZATION
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            initializeNavigation();

            initializeAttendanceForm();

            initializeMemberForm();

            initializeMemberModal();

            initializeFilters();

            initializeExport();

            initializeButtons();

            updateDate();

            updateClock();

            renderAll();

        } catch (error) {

            console.error(
                "ERROR APLIKASI:",
                error
            );

        } finally {

            /*
            Loading selalu ditutup,
            walaupun ada error.
            */

            setTimeout(() => {

                const loading =
                    $("#loadingScreen");

                if (loading) {

                    loading.classList.add(
                        "hide"
                    );

                }

            }, 500);

        }

    }
);


/* ==================================================
   NAVIGATION
================================================== */

function initializeNavigation() {

    const navItems =
        $$(".nav-item");

    navItems.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    showPage(page);

                }
            );

        }
    );

}


function showPage(pageName) {

    $$(".page").forEach(
        (page) => {

            page.classList.remove(
                "active"
            );

        }
    );


    const selectedPage =
        document.getElementById(
            pageName
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active"
        );

    }


    $$(".nav-item").forEach(
        (button) => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );

        }
    );


    const titles = {

        dashboard: "Dashboard",

        absensi: "Absensi",

        rekap: "Rekap Absensi",

        anggota: "Data Anggota"

    };


    const title =
        $("#pageTitle");


    if (title) {

        title.textContent =
            titles[pageName] ||
            "Dashboard";

    }


    /*
    Tutup sidebar di HP.
    */

    const sidebar =
        $("#sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    renderAll();

}


/* ==================================================
   MOBILE MENU
================================================== */

function initializeButtons() {

    const menuButton =
        $("#menuButton");


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                const sidebar =
                    $("#sidebar");

                if (sidebar) {

                    sidebar.classList.toggle(
                        "open"
                    );

                }

            }
        );

    }


    const quickAttendance =
        $("#quickAttendance");


    if (quickAttendance) {

        quickAttendance.addEventListener(
            "click",
            () => {

                showPage("absensi");

            }
        );

    }


    const viewRecap =
        $("#viewRecap");


    if (viewRecap) {

        viewRecap.addEventListener(
            "click",
            () => {

                showPage("rekap");

            }
        );

    }


    const addMemberButton =
        $("#addMemberButton");


    if (addMemberButton) {

        addMemberButton.addEventListener(
            "click",
            openMemberModal
        );

    }


    const closeToast =
        $("#closeToast");


    if (closeToast) {

        closeToast.addEventListener(
            "click",
            hideToast
        );

    }

}


/* ==================================================
   DATE & CLOCK
================================================== */

function updateDate() {

    const now =
        new Date();


    const dateText =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const currentDate =
        $("#currentDate");


    if (currentDate) {

        currentDate.textContent =
            dateText;

    }


    const attendanceDate =
        $("#attendanceDate");


    if (attendanceDate) {

        attendanceDate.textContent =
            dateText;

    }


    const monthName =
        $("#monthName");


    if (monthName) {

        monthName.textContent =
            now.toLocaleDateString(
                "id-ID",
                {
                    month: "long",
                    year: "numeric"
                }
            );

    }

}


function updateClock() {

    const clock =
        $("#clock");


    if (!clock) {
        return;
    }


    function update() {

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


    update();

    setInterval(
        update,
        1000
    );

}


/* ==================================================
   ATTENDANCE FORM
================================================== */

function initializeAttendanceForm() {

    const form =
        $("#attendanceForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const memberId =
                $("#memberSelect")?.value;


            const status =
                document.querySelector(
                    'input[name="status"]:checked'
                )?.value;


            const note =
                $("#note")?.value.trim() ||
                "";


            if (!memberId) {

                showToast(
                    "Peringatan",
                    "Pilih anggota terlebih dahulu.",
                    "warning"
                );

                return;

            }


            if (!status) {

                showToast(
                    "Peringatan",
                    "Pilih status kehadiran.",
                    "warning"
                );

                return;

            }


            const member =
                members.find(
                    (item) =>
                        item.id === memberId
                );


            if (!member) {

                showToast(
                    "Error",
                    "Anggota tidak ditemukan.",
                    "error"
                );

                return;

            }


            const today =
                getDateKey(
                    new Date()
                );


            /*
            Satu anggota hanya boleh
            mempunyai satu absensi
            pada tanggal yang sama.
            */

            const existingIndex =
                attendance.findIndex(
                    (item) =>
                        item.memberId === memberId &&
                        item.date === today
                );


            const now =
                new Date();


            const record = {

                id:
                    existingIndex >= 0
                        ? attendance[existingIndex].id
                        : generateId(),

                memberId,

                memberName:
                    member.name,

                date:
                    today,

                status,

                note,

                time:
                    now.toLocaleTimeString(
                        "id-ID",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    ),

                createdAt:
                    now.toISOString()

            };


            if (existingIndex >= 0) {

                attendance[
                    existingIndex
                ] = record;

            } else {

                attendance.push(
                    record
                );

            }


            saveData(
                STORAGE_ATTENDANCE,
                attendance
            );


            form.reset();


            renderAll();


            showToast(
                "Berhasil",
                existingIndex >= 0
                    ? "Absensi berhasil diperbarui."
                    : "Absensi berhasil disimpan.",
                "success"
            );

        }
    );

}


/* ==================================================
   MEMBER
================================================== */

function initializeMemberForm() {

    const form =
        $("#memberForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const input =
                $("#memberName");


            const name =
                input?.value.trim();


            if (!name) {

                showToast(
                    "Peringatan",
                    "Nama anggota wajib diisi.",
                    "warning"
                );

                return;

            }


            const exists =
                members.some(
                    (member) =>
                        member.name.toLowerCase() ===
                        name.toLowerCase()
                );


            if (exists) {

                showToast(
                    "Peringatan",
                    "Nama anggota sudah ada.",
                    "warning"
                );

                return;

            }


            members.push({

                id:
                    generateId(),

                name

            });


            saveData(
                STORAGE_MEMBERS,
                members
            );


            form.reset();


            closeMemberModal();


            renderAll();


            showToast(
                "Berhasil",
                `${name} berhasil ditambahkan.`,
                "success"
            );

        }
    );

}


function initializeMemberModal() {

    const closeButton =
        $("#closeMemberModal");


    const cancelButton =
        $("#cancelMember");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMemberModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeMemberModal
        );

    }


    const modal =
        $("#memberModal");


    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modal
                ) {

                    closeMemberModal();

                }

            }
        );

    }

}


function openMemberModal() {

    const modal =
        $("#memberModal");


    if (modal) {

        modal.classList.add(
            "show"
        );

    }


    setTimeout(
        () => {

            $("#memberName")?.focus();

        },
        100
    );

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


/* ==================================================
   FILTER
================================================== */

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


/* ==================================================
   EXPORT CSV
================================================== */

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

    const filtered =
        getFilteredAttendance();


    if (!filtered.length) {

        showToast(
            "Info",
            "Tidak ada data untuk diexport.",
            "warning"
        );

        return;

    }


    const header = [
        "Tanggal",
        "Nama",
        "Status",
        "Waktu",
        "Catatan"
    ];


    const rows =
        filtered.map(
            (item) => [

                item.date,

                item.memberName,

                item.status,

                item.time,

                item.note || ""

            ]
        );


    const csv = [

        header,

        ...rows

    ]
        .map(
            (row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value)
                                .replace(/"/g, '""')}"`
                    )
                    .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        `rekap-absensi-${getDateKey(new Date())}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Berhasil",
        "Data berhasil diexport.",
        "success"
    );

}


/* ==================================================
   RENDER ALL
================================================== */

function renderAll() {

    renderMemberSelect();

    renderMemberFilter();

    renderDashboard();

    renderTodayAttendance();

    renderMembers();

    renderRecap();

}


/* ==================================================
   MEMBER SELECT
================================================== */

function renderMemberSelect() {

    const select =
        $("#memberSelect");


    if (!select) {
        return;
    }


    const current =
        select.value;


    select.innerHTML =
        `
        <option value="">
            -- Pilih Anggota --
        </option>
        `;


    members.forEach(
        (member) => {

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

        }
    );


    if (
        members.some(
            (member) =>
                member.id === current
        )
    ) {

        select.value =
            current;

    }

}


/* ==================================================
   MEMBER FILTER
================================================== */

function renderMemberFilter() {

    const select =
        $("#memberFilter");


    if (!select) {
        return;
    }


    const current =
        select.value ||
        "all";


    select.innerHTML =
        `
        <option value="all">
            Semua Anggota
        </option>
        `;


    members.forEach(
        (member) => {

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

        }
    );


    select.value =
        current;

}


/* ==================================================
   DASHBOARD
================================================== */

function renderDashboard() {

    const today =
        getDateKey(
            new Date()
        );


    const todayData =
        attendance.filter(
            (item) =>
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
        getWeekAttendance();


    const weekPresent =
        countStatus(
            weekData,
            "Hadir"
        );


    setText(
        "#weekPresent",
        weekPresent
    );


    const weekTotal =
        members.length * 7;


    const weekPercent =
        weekTotal > 0
            ? Math.min(
                100,
                Math.round(
                    (weekPresent /
                        weekTotal) *
                    100
                )
            )
            : 0;


    setText(
        "#weekPercentage",
        `${weekPercent}%`
    );


    setWidth(
        "#weekProgress",
        weekPercent
    );


    const monthData =
        getMonthAttendance();


    const monthPresent =
        countStatus(
            monthData,
            "Hadir"
        );


    setText(
        "#monthPresent",
        monthPresent
    );


    const daysInMonth =
        new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
        ).getDate();


    const monthTotal =
        members.length *
        daysInMonth;


    const monthP
