$(document).ready(function() {
    function populatePersonnel() {
        return $.ajax({
            url: 'libs/php/getAll.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const personnelTableBody = $("#personnelTableBody");
                    personnelTableBody.empty();

                    response.data.forEach(function(person) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${person.firstName} ${person.lastName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        personnelTableBody.append(row);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function populateDepartments() {
        return $.ajax({
            url: 'libs/php/getAllDepartments.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const departmentTableBody = $("#departmentTableBody");
                    departmentTableBody.empty();

                    response.data.forEach(function(department) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${department.name}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        departmentTableBody.append(row);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function populateLocations() {
        return $.ajax({
            url: 'libs/php/getLocations.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const locationTableBody = $("#locationTableBody");
                    locationTableBody.empty();

                    response.data.forEach(function(location) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${location.name}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        locationTableBody.append(row);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function closeModalOnEsc() {
        $(document).on('keydown', function(event) {
            if (event.key === "Escape") {
                $('.modal').modal('hide');
            }
        });
    }

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
        if ($("#locationsBtn").hasClass("active")) {
            $("#filterBtn").hide();
        } else {
            $("#filterBtn").show();
        }
    });

    $("#filterBtn").click(function () {
        const activeTabId = $(".nav-link.active").attr("id");

        if (activeTabId === "personnelBtn") {
            populateFilterModalOptions("Personnel");
            $("#filterModal").modal('show');
        } else if (activeTabId === "departmentsBtn") {
            populateFilterModalOptions("Department");
            $("#filterDepartmentModal").modal('show');
        }
    });

    $("#filterForm").submit(function(event) {
        event.preventDefault();
        applyPersonnelFilter();
    });

    $("#filterDepartmentForm").submit(function(event) {
        event.preventDefault();
        applyDepartmentFilter();
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

    $("#addPersonnelModal").on("show.bs.modal", function() {
        $("#addPersonnelForm")[0].reset();
    });

    $("#addDepartmentModal").on("show.bs.modal", function() {
        $("#addDepartmentForm")[0].reset();
    });

    $("#addLocationModal").on("show.bs.modal", function() {
        $("#addLocationForm")[0].reset();
    });

    $("#addPersonnelForm").submit(function(event) {
        event.preventDefault();
        addPersonnel();
    });

    $("#addDepartmentForm").submit(function(event) {
        event.preventDefault();
        addDepartment();
    });

    $("#addLocationForm").submit(function(event) {
        event.preventDefault();
        addLocation();
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
                    const location = result.data[0];

                    if (location) {
                        $("#editLocationID").val(location.id);
                        $("#editLocationName").val(location.name);
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

    $(document).on("click", ".deletePersonnelBtn", function() {
        const deletePersonnelId = $(this).data('id');
        const personnelName = $(this).closest('tr').find('td:first').text();
        $("#deletePersonnelModalBody").html(`Are you sure you want to delete <strong>${personnelName}</strong>?`);
        $("#deletePersonnelModal").modal('show');

        $("#confirmDeletePersonnel").click(function() {
            $.ajax({
                url: 'libs/php/deletePersonnelByID.php',
                type: 'POST',
                data: { id: deletePersonnelId },
                dataType: 'json',
                success: function(response) {
                    if (response.status.code === "200") {
                        $("#deletePersonnelModal").modal('hide');
                        populatePersonnel();
                    } else {
                        alert('Error: ' + response.status.description);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                }
            });
        });
    });

    $(document).on("click", ".deleteDepartmentBtn", function() {
        const deleteDepartmentId = $(this).data('id');
        const departmentName = $(this).closest('tr').find('td:first').text();
        $("#deleteDepartmentModalBody").html(`Are you sure you want to delete <strong>${departmentName}</strong>?`);
        $("#deleteDepartmentModal").modal('show');

        $("#confirmDeleteDepartment").click(function() {
            $.ajax({
                url: 'libs/php/deleteDepartmentByID.php',
                type: 'POST',
                data: { id: deleteDepartmentId },
                dataType: 'json',
                success: function(response) {
                    if (response.status.code === "200") {
                        $("#deleteDepartmentModal").modal('hide');
                        populateDepartments();
                    } else if (response.status.code === "403") {
                        alert('Error: ' + response.status.description);
                    } else {
                        alert('Error: ' + response.status.description);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                }
            });
        });
    });

    $(document).on("click", ".deleteLocationBtn", function() {
        const deleteLocationId = $(this).data('id');
        const locationName = $(this).closest('tr').find('td:first').text();
        $("#deleteLocationModalBody").html(`Are you sure you want to delete <strong>${locationName}</strong>?`);
        $("#deleteLocationModal").modal('show');

        $("#confirmDeleteLocation").click(function() {
            $.ajax({
                url: 'libs/php/deleteLocationByID.php',
                type: 'POST',
                data: { id: deleteLocationId },
                dataType: 'json',
                success: function(response) {
                    if (response.status.code === "200") {
                        $("#deleteLocationModal").modal('hide');
                        populateLocations();
                    } else if (response.status.code === "403") {
                        alert('Error: ' + response.status.description);
                    } else {
                        alert('Error: ' + response.status.description);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                }
            });
        });
    });

    // Search and filter functions
    function searchPersonnel(searchText) {
        $.ajax({
            url: 'libs/php/SearchAll.php',
            type: 'GET',
            data: { txt: searchText },
            dataType: 'json',
            success: function (response) {
                if (response.status.code === "200") {
                    const personnelTableBody = $("#personnelTableBody");
                    personnelTableBody.empty();

                    response.data.found.forEach(function (person) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${person.firstName} ${person.lastName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.departmentName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        personnelTableBody.append(row);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function searchDepartments(searchText) {
        $.ajax({
            url: 'libs/php/searchDepartments.php',
            type: 'GET',
            data: { txt: searchText },
            dataType: 'json',
            success: function (response) {
                if (response.status.code === "200") {
                    const departmentTableBody = $("#departmentTableBody");
                    departmentTableBody.empty();

                    response.data.forEach(function (department) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${department.name}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        departmentTableBody.append(row);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function searchLocations(searchText) {
        $.ajax({
            url: 'libs/php/searchLocations.php',
            type: 'GET',
            data: { txt: searchText },
            dataType: 'json',
            success: function (response) {
                if (response.status.code === "200") {
                    const locationTableBody = $("#locationTableBody");
                    locationTableBody.empty();

                    response.data.forEach(function (location) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${location.name}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        locationTableBody.append(row);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function applyDepartmentFilter() {
        const departmentId = $("#filterDepartmentModalDepartment").val();
        const locationId = $("#filterDepartmentModalLocation").val();

        $.ajax({
            url: 'libs/php/filterDepartments.php',
            type: 'GET',
            data: {
                departmentId: departmentId,
                locationId: locationId
            },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const departmentTableBody = $("#departmentTableBody");
                    departmentTableBody.empty();

                    response.data.forEach(function(department) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${department.name}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        departmentTableBody.append(row);
                    });

                    $("#filterDepartmentModal").modal('hide'); 
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
            }
        });
    }

    function applyPersonnelFilter() {
        const departmentId = $("#filterPersonnelDepartment").val();
        const locationId = $("#filterPersonnelLocation").val();

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

                    response.data.forEach(function(person) {
                        const row = `<tr>
                            <td class="align-middle text-nowrap">${person.firstName} ${person.lastName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;

                        personnelTableBody.append(row);
                    });

                    $("#filterModal").modal('hide'); 
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                console.error('Response: ' + jqXHR.responseText);
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
                    } else {
                        console.error('Error: ' + response.status.description);
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
                    } else {
                        console.error('Error: ' + response.status.description);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
                }
            });
        }
    }

    function populateFilterModalOptions(type) {
        $.ajax({
            url: 'libs/php/getAllDepartments.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    const departmentSelect = (type === "Personnel") ? $("#filterPersonnelDepartment") : $("#filterDepartmentModalDepartment");
                    departmentSelect.empty();
                    departmentSelect.append('<option value="">All Departments</option>');
                    response.data.forEach(function(department) {
                        const option = `<option value="${department.id}">${department.name}</option>`;
                        departmentSelect.append(option);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
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
                    const locationSelect = (type === "Personnel") ? $("#filterPersonnelLocation") : $("#filterDepartmentModalLocation");
                    locationSelect.empty();
                    locationSelect.append('<option value="">All Locations</option>');
                    response.data.forEach(function(location) {
                        const option = `<option value="${location.id}">${location.name}</option>`;
                        locationSelect.append(option);
                    });
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    }

    function addPersonnel() {
        const firstName = $("#addFirstName").val();
        const lastName = $("#addLastName").val();
        const jobTitle = $("#addJobTitle").val();
        const email = $("#addEmail").val();
        const departmentId = $("#addDepartment").val();

        $.ajax({
            url: 'libs/php/insertPersonnel.php',
            type: 'POST',
            data: {
                firstName: firstName,
                lastName: lastName,
                jobTitle: jobTitle,
                email: email,
                departmentId: departmentId
            },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    $("#addPersonnelModal").modal('hide');
                    const personnelTableBody = $("#personnelTableBody");
                    const person = response.data;
                    const row = `<tr>
                        <td class="align-middle text-nowrap">${person.firstName} ${person.lastName}</td>
                        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.departmentName}</td>
                        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationName}</td>
                        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>
                        </td>
                    </tr>`;
                    personnelTableBody.append(row);
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    }

    function addDepartment() {
        const name = $("#addDepartmentName").val();
        const locationId = $("#addDepartmentLocation").val();

        $.ajax({
            url: 'libs/php/insertDepartment.php',
            type: 'POST',
            data: {
                name: name,
                locationId: locationId
            },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    $("#addDepartmentModal").modal('hide');
                    const departmentTableBody = $("#departmentTableBody");
                    const department = response.data;
                    const row = `<tr>
                        <td class="align-middle text-nowrap">${department.name}</td>
                        <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </td>
                        </tr>`;
                    departmentTableBody.append(row);
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    }

    function addLocation() {
        const name = $("#addLocationName").val();

        $.ajax({
            url: 'libs/php/insertLocation.php',
            type: 'POST',
            data: { name: name },
            dataType: 'json',
            success: function(response) {
                if (response.status.code === "200") {
                    $("#addLocationModal").modal('hide');
                    populateLocations();
                } else {
                    console.error('Error: ' + response.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    }

    closeModalOnEsc();
    populatePersonnel();
    populateDepartments();
    populateLocations();
});
