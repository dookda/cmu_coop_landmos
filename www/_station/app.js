var usrname;
var rtktoken;
var gid;

const checkList = () => {
    const checkboxes = document.querySelectorAll('input[name="stations"]:checked');
    const values = Array.from(checkboxes).map(cb => cb.value);
    const data = JSON.stringify(values);
    console.log(values);
    axios.post("/apiv2/basestation_update_list", { stations: data }).then(r => {
        console.log(r);
    })
};

const deleteStation = (stat_code) => {
    console.log(stat_code);
    axios.post("/apiv2/basestation_delete", { stat_code }).then(r => {
        console.log(r);
        $('#table').DataTable().ajax.reload();
    })
};

const conFirmDetete = (stat_code) => {
    Swal.fire({
        title: 'ยืนยันการลบสถานี ' + stat_code,
        // showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('ลบสถานี ' + stat_code + ' สำเร็จ')
            deleteStation(stat_code);
        }
    })
}

let showData = () => {
    var table = $('#table').DataTable({
        ajax: {
            type: 'GET',
            url: '/apiv2/basestation',
            // data: data,
            dataSrc: 'data',
            destroy: true
        },
        columns: [
            { data: 'id', visible: false, },
            { data: 'stat_code' },
            { data: 'lat' },
            { data: 'lng' },
            { data: 'ts' },
            {
                data: '',
                render: function (data, type, row) {
                    return `<div>
                                <input type="checkbox" name="stations" value="${row.stat_code}" ${row.active == true ? "checked" : ""} onchange="checkList()">
                            </div>`
                }
            },
            {
                data: '',
                render: function (data, type, row) {
                    return `<div>
                                <button class="btn btn-inverse-danger" onclick="conFirmDetete('${row.stat_code}')"><i class="bi bi-trash"></i>ลบ</button>
                            </div>`
                }
            }
        ],
        "order": [[1, 'asc']],
        // "paging": true,
        // "ordering": true,
        // "info": false,
        // "filter": true,
        // dom: 'Bfrtip',
        // buttons: [
        //     'excel', 'print'
        // ],
        // responsive: true,
        scrollX: true,
        // order: [[5, 'asc']],
    });

    table.on('search.dt', async () => {
        let dat = table.rows({ search: 'applied' }).data();
        // console.log(dat);
    })
}

// login
let getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const displayLogin = () => {
    gid = getCookie("rtkgid");
    usrname = getCookie("rtkname");
    document.getElementById("profile").innerHTML = `<a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown">
                        <span><i class="bi bi-person-circle"></i>${usrname}</span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
                        <a class="dropdown-item" href="./../_profile/index.html">
                            <i class="ti-settings text-primary"></i>Settings
                        </a>
                        <a class="dropdown-item" onclick="logout()">
                            <i class="ti-power-off text-primary"></i>Logout
                        </a>
                    </div>`
    // showList(r);;
}

const displayLogout = () => {
    document.getElementById("profile").innerHTML = `<a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown" onclick="login()">
                                                        <span><i class="bi bi-person-circle"></i>เข้าสู่ระบบ</span>
                                                    </a>`;
}

let gotoDashboard = () => {
    location.href = "./../_dashboard/index.html";
}

const showLogin = (txt1, text2) => {
    Swal.fire(
        txt1,
        text2,
        ''
    ).then((result) => {
        if (result.value) {
            gotoDashboard();
        }
    })
}

const checkLogin = () => {
    let page = "_station";
    let gid = getCookie("rtkgid");
    usrname = getCookie("rtkname");
    rtktoken = getCookie("rtktoken");
    // console.log(usrname, rtktoken);
    if (usrname !== "" && rtktoken !== "") {
        const headers = {
            'Authorization': `Bearer ${rtktoken}`,
            'Content-Type': 'application/json'
        }

        axios.post('/apiv2/checktoken', { username: usrname, page, gid }, { headers })
            .then(r => {
                if (r.status === 200 && r.data.auth) {
                    displayLogin();
                    showData();
                } else {
                    showLogin("ท่านไม่มีสิทธิ์เข้าถึงหน้านี้", "หากต้องการเข้าถึงข้อมูล โปรดติดต่อ admin");
                }
            })
    } else {
        showLogin("ท่านยังไม่ได้เข้าสู่ระบบ", "กรุณา login");
    }
}

const logout = () => {
    gid = defaultGid;
    document.cookie = "rtkname=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "rtktoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "rtkgid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    checkLogin();
};

const login = async () => {
    await Swal.fire({
        title: 'เข้าสู่ระบบ ',
        html: `<form>
                username: <input id="eno" type="text" class="swal2-input" autocomplete="username">
                password: <input id="pwd" type="password" class="swal2-input" autocomplete="current-password">
            </form>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'เข้าสู่ระบบ',
        preConfirm: () => {
            axios.post('/apiv2/login', {
                eno: document.getElementById('eno').value,
                pwd: document.getElementById('pwd').value
            }).then(r => {
                if (r.data.status == "Verified") {
                    var expirationTime = new Date(r.data.exp * 1000);
                    var expires = expirationTime.toUTCString();

                    document.cookie = `rtkname=${r.data.eno}; expires=${expires}; path=/;`;
                    document.cookie = `rtktoken=${r.data.token}; expires=${expires}; path=/;`;
                    document.cookie = `rtkgid=${r.data.gid}; expires=${expires}; path=/;`;
                    // console.log(r.data);
                    setTimeout(() => {
                        checkLogin();
                    }, 1500);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'username หรือ password ไม่ถูกต้อง'
                    });
                }
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    });
}

$("#update").text(moment().format("DD-MM-YYYY HH:ss น."));


$(document).ready(function () {
    checkLogin();
});

// show version
axios.get("/apiv2/version").then(r => {
    $("#version").html(r.data.version)
})