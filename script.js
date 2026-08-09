"use strict";

/* =========================================================
   ABSEN 577 — SCRIPT.JS FINAL
========================================================= */

const MEMBERS_KEY = "absen577_members";
const ATTENDANCE_KEY = "absen577_attendance";

let members = load(MEMBERS_KEY, [
    {
        id: "member-default",
        name: "Rivano"
    }
]);

let attendance = load(ATTENDANCE_KEY, []);

let toastTimer;


/* =========================================================
   HELPER
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


function load(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        return JSON.parse(data);

    } catch (error) {
        console.error("Storage error:", error);
        return fallback;
    }
}


function save(key, data) {
    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


function createId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 9)
    );
}


function today() {
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


function currentMonth() {
    return today().substring(0, 7);
}


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(
        `${dateString}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function statusName(status) {

    const names = {
        hadir: "Hadir",
        izin: "Izin",
        sakit: "Sakit",
        alpa: "Alpa"
    };

    return names[status] || status;
}


function initials(name) {

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word =>
            word.charAt(0).toUpperCase()
        )
        .join("");
}


function setText(selector, value) {

    const element = $(selector);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initNavigation();

        initMobileMenu();

        initAttendance();

        initMembers();

        initFilters();

        initExport();

        initToast();

        setDefaultDates();

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
   NAVIGATION
========================================================= */

function initNavigation() {

    $$(".nav-item[data-page]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.page
                    );

                    closeSidebar();

                }
            );

        });

}


function openPage(page) {

    $$(".nav-item[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    $$(".page")
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.id === `page-${page}`
            );

        });


    const titles = {

        dashboard: [
            "Dashboard",
            "Pantau kehadiran anggota dengan mudah."
        ],

        attendance: [
            "Absensi Harian",
            "Catat kehadiran anggota setiap hari."
        ],

        weekly: [
            "Rekap Mingguan",
            "Rekap kehadiran selama 7 hari terakhir."
        ],

        monthly: [
            "Rekap Bulanan",
            "Lihat statistik kehadiran setiap bulan."
        ],

        members: [
            "Data Anggota",
            "Kelola daftar anggota yang mengikuti absensi."
        ]

    };


    const data =
        titles[page] ||
        titles.dashboard;


    setText(
        "#topbarTitle",
        data[0]
    );

    setText(
        "#topbarSubtitle",
        data[1]
    );


    if (page === "dashboard") {
        renderDashboard();
    }

    if (page === "attendance") {
        renderAttendance();
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
   MOBILE
========================================================= */

function initMobileMenu() {

    const button =
        $("#menuButton");

    button?.addEventListener(
        "click",
        () => {

            $(".sidebar")
                ?.classList.add("open");

            $(".sidebar-overlay")
                ?.classList.add("show");

        }
    );


    $(".sidebar-overlay")
        ?.addEventListener(
            "click",
            closeSidebar
        );

}


function closeSidebar() {

    $(".sidebar")
        ?.classList.remove("open");

    $(".sidebar-overlay")
        ?.classList.remove("show");

}


/* =========================================================
   DATE / CLOCK
========================================================= */

function setDefaultDates() {

    const dateInput =
        $("#attendanceDate");

    if (dateInput) {
        dateInput.value = today();
    }


    const filterDate =
        $("#filterDate");

    if (filterDate) {
        filterDate.value = today();
    }


    const filterMonth =
        $("#filterMonth");

    if (filterMonth) {
        filterMonth.value = currentMonth();
    }


    updateDate();

    updateClock();

}


function updateDate() {

    setText(
        "#currentDate",
        new Date().toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )
    );


    setText(
        "#todayDate",
        new Date().toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )
    );

}


function updateClock() {

    const clock = $("#clock");

    if (!clock) return;


    function tick() {

        clock.textContent =
            new Date().toLocaleTimeString(
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


/* =========================================================
   ATTENDANCE
========================================================= */

function initAttendance() {

    const form =
        $("#attendanceForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        handleAttendanceSubmit
    );


    populateMembers();

}


function populateMembers() {

    const select =
        $("#attendanceMember");

    if (!select) return;


    select.innerHTML = `
        <option value="">
            Pilih anggota
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

}


function handleAttendanceSubmit(event) {

    event.preventDefault();


    const date =
        $("#attendanceDate")?.value;


    const memberId =
        $("#attendanceMember")?.value;


    const status =
        document.querySelector(
            'input[name="status"]:checked'
        )?.value;


    const note =
        $("#attendanceNote")?.value.trim() || "";


    /* VALIDASI */

    if (!date) {

        showToast(
            "Perhatian",
            "Tanggal belum dipilih."
        );

        return;
    }


    if (!memberId) {

        showToast(
            "Perhatian",
            "Silakan pilih anggota."
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


    /*
       CEK ABSEN HARI INI

       Kalau sudah ada:
       data akan diperbarui,
       bukan membuat duplikat.
    */

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
            "Absensi diperbarui",
            `${member.name} pada ${formatDate(date)} diperbarui.`
        );

    } else {

        attendance.push(record);


        showToast(
            "Absensi berhasil",
            `${member.name} berhasil diabsen.`
        );

    }


    save(
        ATTENDANCE_KEY,
        attendance
    );


    resetAttendanceForm();

    renderAll();

}


function resetAttendanceForm() {

    const form =
        $("#attendanceForm");

    if (form) {
        form.reset();
    }


    const dateInput =
        $("#attendanceDate");

    if (dateInput) {
        dateInput.value = today();
    }

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


    const yes =
        confirm(
            `Hapus absensi ${record.memberName} pada ${formatDate(record.date)}?`
        );


    if (!yes) return;


    attendance =
        attendance.filter(
            item =>
                item.id !== id
        );


    save(
        ATTENDANCE_KEY,
        attendance
    );


    renderAll();


    showToast(
        "Berhasil",
        "Data absensi telah dihapus."
    );

}


/* =========================================================
   MEMBERS
========================================================= */

function initMembers() {

    $("#memberForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                addMember();

            }
        );


    $("#addMemberButton")
        ?.addEventListener(
            "click",
            openMemberModal
        );


    $("#closeMemberModal")
        ?.addEventListener(
            "click",
            closeMemberModal
        );


    $("#memberModal")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "memberModal"
                ) {

                    closeMemberModal();

                }

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


    const exists =
        members.some(
            member =>
                member.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {

        showToast(
            "Perhatian",
            "Anggota dengan nama tersebut sudah ada."
        );

        return;
    }


    members.push({

        id: createId(),

        name

    });


    save(
        MEMBERS_KEY,
        members
    );


    input.value = "";


    populateMembers();

    renderAll();

    closeMemberModal();


    showToast(
        "Berhasil",
        `${name} berhasil ditambahkan.`
    );

}


function openMemberModal() {

    $("#memberModal")
        ?.classList.add("show");


    setTimeout(
        () =>
            $("#memberName")?.focus(),
        100
    );

}


function closeMemberModal() {

    $("#memberModal")
        ?.classList.remove("show");

}


function deleteMember(id) {

    const member =
        members.find(
            item =>
                item.id === id
        );


    if (!member) return;


    const yes =
        confirm(
            `Hapus anggota "${member.name}"?\n\nSemua data absensinya juga akan dihapus.`
        );


    if (!yes) return;


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


    save(
        MEMBERS_KEY,
        members
    );


    save(
        ATTENDANCE_KEY,
        attendance
    );


    populateMembers();

    renderAll();


    showToast(
        "Berhasil",
        `${member.name} telah dihapus.`
    );

}


/* =========================================================
   FILTER
========================================================= */

function initFilters() {

    $("#filterDate")
        ?.addEventListener(
            "change",
            renderAttendance
        );


    $("#filterMonth")
        ?.addEventListener(
            "change",
            renderMonthly
        );

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const records =
        attendance.filter(
            item =>
                item.date === today()
        );


    const count =
        countStatuses(records);


    setText(
        "#totalHadir",
        count.hadir
    );

    setText(
        "#totalIzin",
        count.izin
    );

    setText(
        "#totalSakit",
        count.sakit
    );

    setText(
        "#totalAlpa",
        count.alpa
    );


    const percentage =
        members.length > 0
            ? Math.round(
                (count.hadir /
                    members.length) *
                100
            )
            : 0;


    setText(
        "#attendancePercentage",
        `${percentage}%`
    );


    const progress =
        $("#attendanceProgress");


    if (progress) {

        progress.style.width =
            `${Math.min(percentage, 100)}%`;

    }


    setText(
        "#weeklyTotal",
        getLast7DaysRecords().length
    );


    setText(
        "#monthlyTotal",
        attendance.filter(
            item =>
                item.date.startsWith(
                    currentMonth()
                )
        ).length
    );


    renderToday();

    renderRecent();

}


function countStatuses(records) {

    return {

        hadir:
            records.filter(
                item =>
                    item.status === "hadir"
            ).length,

        izin:
            records.filter(
                item =>
                    item.status === "izin"
            ).length,

        sakit:
            records.filter(
                item =>
                    item.status === "sakit"
            ).length,

        alpa:
            records.filter(
                item =>
                    item.status === "alpa"
            ).length

    };

}


/* =========================================================
   TODAY
========================================================= */

function renderToday() {

    const container =
        $("#todayList");

    if (!container) return;


    const records =
        attendance
            .filter(
                item =>
                    item.date === today()
            )
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
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
            .map(record => `

                <div class="today-item">

                    <div class="today-member">

                        <div class="avatar">
                            ${escapeHTML(
                                initials(
                                    record.memberName
                                )
                            )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    record.memberName
                                )}
                            </strong>

                            <small>
                                ${formatDate(
                                    record.date
                                )}
                            </small>

                        </div>

                    </div>

                    <span class="status-badge ${record.status}">
                        ${statusName(
                            record.status
                        )}
                    </span>

                </div>

            `)
            .join("");

}


/* =========================================================
   RECENT
========================================================= */

function renderRecent() {

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
                                <strong>
                                    ${escapeHTML(
                                        record.memberName
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${formatDate(
                                    record.date
                                )}
                            </td>

                            <td>
                                <span class="status-badge ${record.status}">
                                    ${statusName(
                                        record.status
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHTML(
                                    record.note || "-"
                                )}
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

function renderAttendance() {

    populateMembers();


    const container =
        $("#attendanceTable");

    if (!container) return;


    const selectedDate =
        $("#filterDate")?.value ||
        today();


    const records =
        attendance
            .filter(
                item =>
                    item.date === selectedDate
            )
            .sort(
                (a, b) =>
                    a.memberName.localeCompare(
                        b.memberName
                    )
            );


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📅</div>
                <h3>Belum ada absensi</h3>
                <p>
                    Tidak ada data untuk
                    ${formatDate(selectedDate)}.
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
                                    ${escapeHTML(
                                        record.memberName
                                    )}
                                </strong>
                            </td>

                            <td>
                                <span class="status-badge ${record.status}">
                                    ${statusName(
                                        record.status
                                    )}
                                </span>
                            </td>

                            <td>
                                ${escapeHTML(
                                    record.note || "-"
                                )}
                            </td>

                            <td>

                                <button
                                    class="delete-button"
                                    type="button"
                                    data-delete-attendance="${record.id}"
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


    container
        .querySelectorAll(
            "[data-delete-attendance]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteAttendance(
                        button.dataset
                            .deleteAttendance
                    );

                }
            );

        });

}


/* =========================================================
   WEEKLY
========================================================= */

function getLast7DaysRecords() {

    const now =
        new Date();


    now.setHours(
        23,
        59,
        59,
        999
    );


    const start =
        new Date();


    start.setHours(
        0,
        0,
        0,
        0
    );


    start.setDate(
        start.getDate() - 6
    );


    return attendance.filter(
        record => {

            const date =
                new Date(
                    `${record.date}T00:00:00`
                );

            return (
                date >= start &&
                date <= now
            );

        }
    );

}


function renderWeekly() {

    const records =
        getLast7DaysRecords();


    const count =
        countStatuses(records);


    setText(
        "#weeklyHadir",
        count.hadir
    );

    setText(
        "#weeklyIzin",
        count.izin
    );

    setText(
        "#weeklySakit",
        count.sakit
    );

    setText(
        "#weeklyAlpa",
        count.alpa
    );


    renderRecap(
        "#weeklyTable",
        records
    );

}


/* =========================================================
   MONTHLY
========================================================= */

function renderMonthly() {

    const selectedMonth =
        $("#filterMonth")?.value ||
        currentMonth();


    const records =
        attendance.filter(
            item =>
                item.date.startsWith(
                    selectedMonth
                )
        );


    const count =
        countStatuses(records);


    setText(
        "#monthlyHadir",
        count.hadir
    );

    setText(
        "#monthlyIzin",
        count.izin
    );

    setText(
        "#monthlySakit",
        count.sakit
    );

    setText(
        "#monthlyAlpa",
        count.alpa
    );


    renderRecap(
        "#monthlyTable",
        records
    );

}


/* =========================================================
   RECAP
========================================================= */

function renderRecap(
    selector,
    records
) {

    const container =
        $(selector);

    if (!container) return;


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📊</div>
                <h3>Belum ada data</h3>
                <p>Belum ada data absensi.</p>
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


        grouped[
            record.memberId
        ][record.status]++;

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
                                        ${escapeHTML(
                                            row.name
                                        )}
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
   MEMBERS PAGE
========================================================= */

function renderMembers() {

    const container =
        $("#membersTable");

    if (!container) return;


    setText(
        "#memberCount",
        members.length
    );


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
                                                ${escapeHTML(
                                                    initials(
                                                        member.name
                                                    )
                                                )}
                                            </div>

                                            <div>

                                                <strong>
                                                    ${escapeHTML(
                                                        member.name
                                                    )}
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
                                            type="button"
                                            data-delete-member="${member.id}"
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


    container
        .querySelectorAll(
            "[data-delete-member]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteMember(
                        button.dataset
                            .deleteMember
                    );

                }
            );

        });

}


/* =========================================================
   EXPORT CSV
========================================================= */

function initExport() {

    $("#exportButton")
        ?.addEventListener(
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
            .map(record => [

                record.date,

                record.memberName,

                statusName(
                    record.status
                ),

                record.note || ""

            ]);


    const csv = [

        header,

        ...rows

    ]
        .map(row =>
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
                    "text/csv;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `absen-577-${today()}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Export berhasil",
        "Data absensi berhasil diunduh."
    );

}


function csvEscape(value) {

    const text =
        String(value ?? "");


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return `"${text.replaceAll(
            '"',
            '""'
        )}"`;

    }


    return text;

}


/* =========================================================
   TOAST
========================================================= */

function initToast() {

    $("#closeToast")
        ?.addEventListener(
            "click",
            hideToast
        );

}


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

    $("#toast")
        ?.classList.remove(
            "show"
        );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    updateDate();

    populateMembers();

    renderDashboard();

    renderAttendance();

    renderWeekly();

    renderMonthly();

    renderMembers();

}


/* =========================================================
   GLOBAL
========================================================= */

window.openPage =
    openPage;

window.deleteAttendance =
    deleteAttendance;

window.deleteMember =
    deleteMember;

window.closeMemberModal =
    closeMemberModal;

window.showToast =
    showToast;
