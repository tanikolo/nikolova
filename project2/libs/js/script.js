$(document).ready(function() {
    function populatePersonnel() {
        $.ajax({
            url: 'libs/php/getAll.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const personnelTableBody = $("#personnelTableBody");
                    personnelTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.sort((a, b) => a.lastName.localeCompare(b.lastName)).forEach(function(person) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = `${person.lastName}, ${person.firstName}`;
                        row.appendChild(nameCell);

                        const departmentCell = document.createElement("td");
                        departmentCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        departmentCell.textContent = person.department;
                        row.appendChild(departmentCell);

                        const locationCell = document.createElement("td");
                        locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        locationCell.textContent = person.location;
                        row.appendChild(locationCell);

                        const emailCell = document.createElement("td");
                        emailCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        emailCell.textContent = person.email;
                        row.appendChild(emailCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    personnelTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function populateDepartments() {
        $.ajax({
            url: 'libs/php/getAllDepartments.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const departmentTableBody = $("#departmentTableBody");
                    departmentTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.sort((a, b) => a.name.localeCompare(b.name)).forEach(function(department) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = department.name;
                        row.appendChild(nameCell);

                        const locationCell = document.createElement("td");
                        locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        locationCell.textContent = department.locationName;
                        row.appendChild(locationCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    departmentTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function populateLocations() {
        $.ajax({
            url: 'libs/php/getLocations.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const locationTableBody = $("#locationTableBody");
                    locationTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.sort((a, b) => a.name.localeCompare(b.name)).forEach(function(location) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = location.name;
                        row.appendChild(nameCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    locationTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function searchPersonnel(searchText) {
        if (searchText.trim() === "") {
            populatePersonnel();
            return;
        }

        $.ajax({
            url: 'libs/php/SearchAll.php',
            type: 'GET',
            data: { query: searchText },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const personnelTableBody = $("#personnelTableBody");
                    personnelTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.found.sort((a, b) => a.lastName.localeCompare(b.lastName)).forEach(function(person) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = `${person.lastName}, ${person.firstName}`;
                        row.appendChild(nameCell);

                        const departmentCell = document.createElement("td");
                        departmentCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        departmentCell.textContent = person.departmentName;
                        row.appendChild(departmentCell);

                        const locationCell = document.createElement("td");
                        locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        locationCell.textContent = person.locationName;
                        row.appendChild(locationCell);

                        const emailCell = document.createElement("td");
                        emailCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        emailCell.textContent = person.email;
                        row.appendChild(emailCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    personnelTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function searchDepartments(searchText) {
        if (searchText.trim() === "") {
            populateDepartments();
            return;
        }

        $.ajax({
            url: 'libs/php/SearchDepartments.php',
            type: 'GET',
            data: { query: searchText },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const departmentTableBody = $("#departmentTableBody");
                    departmentTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.found.sort((a, b) => a.name.localeCompare(b.name)).forEach(function(department) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = department.name;
                        row.appendChild(nameCell);

                        const locationCell = document.createElement("td");
                        locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        locationCell.textContent = department.locationName;
                        row.appendChild(locationCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    departmentTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function searchLocations(searchText) {
        if (searchText.trim() === "") {
            populateLocations();
            return;
        }

        $.ajax({
            url: 'libs/php/SearchLocations.php',
            type: 'GET',
            data: { query: searchText },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const locationTableBody = $("#locationTableBody");
                    locationTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.found.sort((a, b) => a.name.localeCompare(b.name)).forEach(function(location) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = location.name;
                        row.appendChild(nameCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    locationTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function populateFilterModalOptions() {
        $.ajax({
            url: 'libs/php/getAllDepartments.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const departmentSelect = $("#filterPersonnelByDepartment");
                    departmentSelect.empty();
                    departmentSelect.append('<option value="0">All Departments</option>');
                    response.data.forEach(function(department) {
                        const option = `<option value="${department.id}">${department.name}</option>`;
                        departmentSelect.append(option);
                    });
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });

        $.ajax({
            url: 'libs/php/getLocations.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const locationSelect = $("#filterPersonnelByLocation");
                    locationSelect.empty();
                    locationSelect.append('<option value="0">All Locations</option>');
                    response.data.forEach(function(location) {
                        const option = `<option value="${location.id}">${location.name}</option>`;
                        locationSelect.append(option);
                    });
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    }

    function populateAddModalOptions(type) {
        if (type === "Personnel") {
            $.ajax({
                url: 'libs/php/getAllDepartments.php',
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    if (response.status.code === "200") {
                        const departmentSelect = $("#addDepartment");
                        departmentSelect.empty();
                        departmentSelect.append('<option value="">Select Department</option>');
                        response.data.forEach(function(department) {
                            const option = `<option value="${department.id}">${department.name}</option>`;
                            departmentSelect.append(option);
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                }
            });
        } else if (type === "Department") {
            $.ajax({
                url: 'libs/php/getLocations.php',
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    if (response.status.code === "200") {
                        const locationSelect = $("#addDepartmentLocation");
                        locationSelect.empty();
                        locationSelect.append('<option value="">Select Location</option>');
                        response.data.forEach(function(location) {
                            const option = `<option value="${location.id}">${location.name}</option>`;
                            locationSelect.append(option);
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                }
            });
        }
    }

    function applyPersonnelFilter(departmentId, locationId) {
        $.ajax({
            url: 'libs/php/filterPersonnel.php',
            type: 'GET',
            data: {
                departmentId: departmentId,
                locationId: locationId
            },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const personnelTableBody = $("#personnelTableBody");
                    personnelTableBody.empty();

                    const fragment = document.createDocumentFragment();

                    response.data.sort((a, b) => a.lastName.localeCompare(b.lastName)).forEach(function(person) {
                        const row = document.createElement("tr");

                        const nameCell = document.createElement("td");
                        nameCell.className = "align-middle text-nowrap";
                        nameCell.textContent = `${person.lastName}, ${person.firstName}`;
                        row.appendChild(nameCell);

                        const departmentCell = document.createElement("td");
                        departmentCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        departmentCell.textContent = person.department;
                        row.appendChild(departmentCell);

                        const locationCell = document.createElement("td");
                        locationCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        locationCell.textContent = person.location;
                        row.appendChild(locationCell);

                        const emailCell = document.createElement("td");
                        emailCell.className = "align-middle text-nowrap d-none d-md-table-cell";
                        emailCell.textContent = person.email;
                        row.appendChild(emailCell);

                        const actionCell = document.createElement("td");
                        actionCell.className = "text-end text-nowrap";
                        actionCell.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>`;
                        row.appendChild(actionCell);

                        fragment.appendChild(row);
                    });

                    personnelTableBody.append(fragment);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    $("#filterBtn").click(function () {
        populateFilterModalOptions();
        $("#filterPersonnelModal").modal('show');
    });

    $("#filterPersonnelByDepartment").change(function () {
        if (this.value > 0) {
            $("#filterPersonnelByLocation").val(0);
        }
    });

    $("#filterPersonnelByLocation").change(function () {
        if (this.value > 0) {
            $("#filterPersonnelByDepartment").val(0);
        }
    });

    $("#filterPersonnelForm").submit(function(event) {
        event.preventDefault();
        const departmentId = $("#filterPersonnelByDepartment").val();
        const locationId = $("#filterPersonnelByLocation").val();
        applyPersonnelFilter(departmentId, locationId);
        $("#filterPersonnelModal").modal('hide');
    });

    $("#areYouSurePersonnelForm").on("submit", function (e) {
        e.preventDefault();
        const personnelId = $("#areYouSurePersonnelID").val();

        $.ajax({
            url: 'libs/php/deletePersonnelByID.php',
            type: 'POST',
            data: { id: personnelId },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    $("#areYouSurePersonnelModal").modal('hide');
                    populatePersonnel();
                } else {
                    alert('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    });

    $("#areYouSureDepartmentForm").on("submit", function(e) {
        e.preventDefault();
        const departmentId = $("#areYouSureDeptID").val();

        $.ajax({
            url: 'libs/php/deleteDepartmentByID.php',
            type: 'POST',
            data: { id: departmentId },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    $("#areYouSureDeleteDepartmentModal").modal('hide');
                    populateDepartments();
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    });

    $("#areYouSureLocationForm").on("submit", function (e) {
        e.preventDefault();
        const locationId = $("#areYouSureLocationID").val();

        $.ajax({
            url: 'libs/php/deleteLocationByID.php',
            type: 'POST',
            data: { id: locationId },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    $("#areYouSureDeleteLocationModal").modal('hide');
                    populateLocations();
                } else {
                    alert('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    });

    $(document).on("click", ".deletePersonnelBtn", function () {
        const personnelId = $(this).attr("data-id");

        $.ajax({
            url: 'libs/php/getPersonnelByID.php',
            type: 'POST',
            dataType: 'json',
            data: { id: personnelId },
            success: function (result) {
                var resultCode = result.status.code;
                if (resultCode == 200) {
                    $('#areYouSurePersonnelID').val(result.data.personnel[0].id);
                    $("#areYouSurePersonnelName").text(result.data["personnel"][0].firstName + " " + result.data["personnel"][0].lastName);
                    $("#areYouSurePersonnelModal").modal("show");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#deleteEmployeeName .modal-title").replaceWith("Error retrieving data");
            }
        });
    });

    $(document).on("click", ".deleteDepartmentBtn", function() {
        const departmentId = $(this).attr("data-id");

        $.ajax({
            url: 'libs/php/checkDepartmentUse.php',
            type: 'POST',
            dataType: 'json',
            data: { id: departmentId },
            success: function(result) {
                if (result.status.code == 200) {
                    if (result.data[0].personnelCount == 0) {
                        $('#areYouSureDeptID').val(departmentId);
                        $("#areYouSureDeptName").text(result.data[0].departmentName);
                        $("#areYouSureDeleteDepartmentModal").modal("show");
                    } else {
                        $("#cantDeleteDeptName").text(result.data[0].departmentName);
                        $("#personnelCount").text(result.data[0].personnelCount);
                        $("#cantDeleteDepartmentModal").modal("show");
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('checkDepartmentUse AJAX error:', textStatus, errorThrown);
            }
        });
    });

    $(document).on("click", ".deleteLocationBtn", function () {
        const locationId = $(this).attr("data-id");

        $.ajax({
            url: 'libs/php/checkLocationUse.php',
            type: 'POST',
            dataType: 'json',
            data: { id: locationId },
            success: function (result) {
                if (result.status.code == 200) {
                    if (result.data[0].departmentCount == 0) {
                        $('#areYouSureLocationID').val(locationId);
                        $("#areYouSureLocationName").text(result.data[0].locationName);
                        $("#areYouSureDeleteLocationModal").modal("show");
                    } else {
                        $("#cantDeleteLocationName").text(result.data[0].locationName);
                        $("#departmentCount").text(result.data[0].departmentCount);
                        $("#cantDeleteLocationModal").modal("show");
                    }
                } else {
                    $("#cantDeleteLocationName").text("Error retrieving data");
                    $("#cantDeleteLocationModal").modal("show");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#cantDeleteLocationName").text("Error retrieving data");
                $("#cantDeleteLocationModal").modal("show");
            }
        });
    });

    $.when(
        populatePersonnel(),
        populateDepartments(),
        populateLocations()
    ).done(function() {
        $("#preloader").fadeOut();
        $("body").removeClass("hidden");
    });

    $("body").addClass("hidden");

    $("#searchInp").on("keyup", function () {
        const searchText = $(this).val();
        const activeTabId = $(".nav-link.active").attr("id");

        if (activeTabId === "personnelBtn") {
            searchPersonnel(searchText);
        } else if (activeTabId === "departmentsBtn") {
            searchDepartments(searchText);
        } else if (activeTabId === "locationsBtn") {
            searchLocations(searchText);
        }
    });

    $("#searchInp").on("focus", function() {
        $(this).val('');
    });

    $("#refreshBtn").click(function () {
        $("#searchInp").val('');
        if ($("#personnelBtn").hasClass("active")) {
            populatePersonnel();
        } else if ($("#departmentsBtn").hasClass("active")) {
            populateDepartments();
        } else {
            populateLocations();
        }
    });

    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        $("#searchInp").val('');
        if ($("#departmentsBtn").hasClass("active")) {
            populateDepartments();
        } else if ($("#locationsBtn").hasClass("active")) {
            populateLocations();
        } else {
            populatePersonnel();
        }
    });

    $("#addBtn").click(function () {
        const activeTabId = $(".nav-link.active").attr("id");

        if (activeTabId === "personnelBtn") {
            populateAddModalOptions("Personnel");
            $("#addPersonnelModal").modal('show');
        } else if (activeTabId === "departmentsBtn") {
            populateAddModalOptions("Department");
            $("#addDepartmentModal").modal('show');
        } else if (activeTabId === "locationsBtn") {
            $("#addLocationModal").modal('show');
        }
    });

    $("#editPersonnelModal").on("show.bs.modal", function (e) {
        const personnelId = $(e.relatedTarget).attr("data-id");

        $.ajax({
            url: "libs/php/getPersonnelByID.php",
            type: "POST",
            dataType: "json",
            data: { id: personnelId },
            success: function (result) {
                const resultCode = result.status.code;

                if (resultCode === "200") {
                    if (result.data.personnel.length > 0) {
                        const personnel = result.data.personnel[0];
                        const departments = result.data.department;

                        $("#editPersonnelEmployeeID").val(personnel.id);
                        $("#editPersonnelFirstName").val(personnel.firstName);
                        $("#editPersonnelLastName").val(personnel.lastName);
                        $("#editPersonnelJobTitle").val(personnel.jobTitle);
                        $("#editPersonnelEmailAddress").val(personnel.email);

                        $("#editPersonnelDepartment").html("");
                        departments.forEach(function(department) {
                            $("#editPersonnelDepartment").append(
                                $("<option>", {
                                    value: department.id,
                                    text: department.name
                                })
                            );
                        });

                        $("#editPersonnelDepartment").val(personnel.departmentID);
                    } else {
                        $("#editPersonnelModal .modal-title").text("No personnel data found");
                        $("#editPersonnelForm").trigger("reset");
                    }
                } else {
                    $("#editPersonnelModal .modal-title").text("Error retrieving data");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#editPersonnelModal .modal-title").text("Error retrieving data");
            }
        });
    });

    $("#editPersonnelForm").on("submit", function (e) {
        e.preventDefault();

        const personnelData = {
            id: $("#editPersonnelEmployeeID").val(),
            firstName: $("#editPersonnelFirstName").val(),
            lastName: $("#editPersonnelLastName").val(),
            jobTitle: $("#editPersonnelJobTitle").val(),
            email: $("#editPersonnelEmailAddress").val(),
            departmentID: $("#editPersonnelDepartment").val()
        };

        $.ajax({
            url: "libs/php/updatePersonnel.php",
            type: "POST",
            dataType: "json",
            data: personnelData,
            success: function (response) {
                const resultCode = response.status.code;
                if (resultCode === "200") {
                    $("#editPersonnelModal").modal('hide');
                    populatePersonnel();
                } else {
                    alert("Error updating personnel.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error updating personnel.");
            }
        });
    });

    $("#editDepartmentModal").on("show.bs.modal", function (e) {
        const departmentId = $(e.relatedTarget).attr("data-id");

        $.ajax({
            url: "libs/php/getDepartmentByID.php",
            type: "POST",
            dataType: "json",
            data: { id: departmentId },
            success: function (result) {
                const resultCode = result.status.code;

                if (resultCode === "200") {
                    const department = result.data.department[0];
                    const locations = result.data.locationOptions;

                    if (department) {
                        $("#editDepartmentID").val(department.id);
                        $("#editDepartmentName").val(department.name);

                        $("#editDepartmentLocation").html("");
                        locations.forEach(function(location) {
                            $("#editDepartmentLocation").append(
                                $("<option>", {
                                    value: location.id,
                                    text: location.name
                                })
                            );
                        });

                        $("#editDepartmentLocation").val(department.locationID);
                    } else {
                        $("#editDepartmentModal .modal-title").text("No department data found");
                        $("#editDepartmentForm").trigger("reset");
                    }
                } else {
                    $("#editDepartmentModal .modal-title").text("Error retrieving data");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#editDepartmentModal .modal-title").text("Error retrieving data");
            }
        });
    });

    $("#editDepartmentForm").on("submit", function (e) {
        e.preventDefault();

        const departmentData = {
            id: $("#editDepartmentID").val(),
            name: $("#editDepartmentName").val(),
            locationID: $("#editDepartmentLocation").val()
        };

        $.ajax({
            url: "libs/php/updateDepartment.php",
            type: "POST",
            dataType: "json",
            data: departmentData,
            success: function (response) {
                const resultCode = response.status.code;
                if (resultCode === "200") {
                    $("#editDepartmentModal").modal('hide');
                    populateDepartments();
                } else {
                    alert("Error updating department.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error updating department.");
            }
        });
    });

    $("#editLocationModal").on("show.bs.modal", function (e) {
        const locationId = $(e.relatedTarget).attr("data-id");

        $.ajax({
            url: "libs/php/getLocationByID.php",
            type: "POST",
            dataType: "json",
            data: { id: locationId },
            success: function (result) {
                const resultCode = result.status.code;

                if (resultCode === "200") {
                    if (result.data && result.data.length > 0) {
                        const location = result.data[0];

                        if (location) {
                            $("#editLocationID").val(location.id);
                            $("#editLocationName").val(location.name);
                        } else {
                            $("#editLocationModal .modal-title").text("No location data found");
                            $("#editLocationForm").trigger("reset");
                        }
                    } else {
                        $("#editLocationModal .modal-title").text("No location data found");
                        $("#editLocationForm").trigger("reset");
                    }
                } else {
                    $("#editLocationModal .modal-title").text("Error retrieving data");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#editLocationModal .modal-title").text("Error retrieving data");
            }
        });
    });

    $("#editLocationForm").on("submit", function (e) {
        e.preventDefault();

        const locationData = {
            id: $("#editLocationID").val(),
            name: $("#editLocationName").val()
        };

        $.ajax({
            url: "libs/php/updateLocation.php",
            type: "POST",
            dataType: "json",
            data: locationData,
            success: function (response) {
                const resultCode = response.status.code;
                if (resultCode === "200") {
                    $("#editLocationModal").modal('hide');
                    populateLocations();
                } else {
                    alert("Error updating location.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error updating location.");
            }
        });
    });

    $("#addPersonnelForm").on("submit", function (e) {
        e.preventDefault();

        const personnelData = {
            firstName: $("#addFirstName").val(),
            lastName: $("#addLastName").val(),
            jobTitle: $("#addJobTitle").val(),
            email: $("#addEmail").val(),
            departmentId: $("#addDepartment").val()
        };

        $.ajax({
            url: "libs/php/insertPersonnel.php",
            type: "POST",
            dataType: "json",
            data: personnelData,
            success: function (response) {
                if (response.status.code === "200") {
                    $("#addPersonnelModal").modal("hide");
                    populatePersonnel();
                } else {
                    alert("Error adding personnel.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error adding personnel.");
            }
        });
    });

    $("#addDepartmentForm").on("submit", function (e) {
        e.preventDefault();

        const departmentData = {
            name: $("#addDepartmentName").val(),
            locationId: $("#addDepartmentLocation").val()
        };

        $.ajax({
            url: "libs/php/insertDepartment.php",
            type: "POST",
            dataType: "json",
            data: departmentData,
            success: function (response) {
                if (response.status.code === "200") {
                    $("#addDepartmentModal").modal("hide");
                    populateDepartments();
                } else {
                    alert("Error adding department.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error adding department.");
            }
        });
    });

    $("#addLocationForm").on("submit", function (e) {
        e.preventDefault();

        const locationData = {
            name: $("#addLocationName").val()
        };

        $.ajax({
            url: "libs/php/insertLocation.php",
            type: "POST",
            dataType: "json",
            data: locationData,
            success: function (response) {
                if (response.status.code === "200") {
                    $("#addLocationModal").modal("hide");
                    populateLocations();
                } else {
                    alert("Error adding location.");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error adding location.");
            }
        });
    });

    $("#personnelBtn").click(function () {
        $("#filterBtn").attr("disabled", false);
        populatePersonnel();
    });

    $("#departmentsBtn").click(function () {
        $("#filterBtn").attr("disabled", true);
        populateDepartments();
    });

    $("#locationsBtn").click(function () {
        $("#filterBtn").attr("disabled", true);
        populateLocations();
    });

    $('#addPersonnelModal, #editPersonnelModal, #addDepartmentModal, #editDepartmentModal, #addLocationModal, #editLocationModal').on('hidden.bs.modal', function () {
        $(this).find('form')[0].reset();
    });
});
