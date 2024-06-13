$(document).ready(function() {

    function populatePersonnelTable() {
      $.ajax({
        url: 'libs/php/getAll.php', 
        method: 'GET',
        dataType: 'json',
        success: function(response) {
          console.log('Response from getAll.php:', response); 
          if (response.status.code === "200" && response.data) {
            const personnel = response.data;
            const personnelTableBody = $("#personnelTableBody");
            personnelTableBody.empty();
  
            personnel.forEach(person => {
              const row = `
                <tr>
                  <td class="align-middle text-nowrap">${person.firstName}, ${person.lastName}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                  <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `;
              personnelTableBody.append(row);
            });
          } else {
            console.error('Failed to fetch personnel data:', response.status.description);
          }
        },
        error: function(error) {
          console.error('Error fetching personnel data:', error);
        }
      });
    }
  
 function populateDepartmentTable() {
      $.ajax({
        url: 'libs/php/getAllDepartments.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
          console.log('Response from getAllDepartments.php:', response);
          if (response.status.code === "200" && response.data) {
            const departments = response.data;
            const departmentTableBody = $("#departmentTableBody");
            departmentTableBody.empty();
  
            departments.forEach(department => {
              const row = `
                <tr>
                  <td class="align-middle text-nowrap">${department.name}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationID}</td>
                  <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `;
              departmentTableBody.append(row);
            });
          } else {
            console.error('Failed to fetch department data:', response.status.description);
          }
        },
        error: function(error) {
          console.error('Error fetching department data:', error);
        }
      });
    }
  
    function populateLocationTable() {
      $.ajax({
        url: 'libs/php/getLocations.php', 
        method: 'GET',
        dataType: 'json',
        success: function(response) {
          console.log('Response from getAllLocations.php:', response);
          if (response.status.code === "200" && response.data) {
            const locations = response.data;
            const locationTableBody = $("#locationTableBody");
            locationTableBody.empty();
  
            locations.forEach(location => {
              const row = `
                <tr>
                  <td class="align-middle text-nowrap">${location.name}</td>
                  <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `;
              locationTableBody.append(row);
            });
          } else {
            console.error('Failed to fetch location data:', response.status.description);
          }
        },
        error: function(error) {
          console.error('Error fetching location data:', error);
        }
      });
    }

    function handleSearch(query) {
      $.ajax({
        url: 'libs/php/SearchAll.php',
        method: 'POST',
        dataType: 'json',
        data: { txt: query },
        success: function(response) {
          console.log('Response from SearchAll.php:', response);
          if (response.status.code === "200" && response.data.found) {
            const results = response.data.found;
            const personnelTableBody = $("#personnelTableBody");
            const departmentTableBody = $("#departmentTableBody");
            const locationTableBody = $("#locationTableBody");
  
            personnelTableBody.empty();
            departmentTableBody.empty();
            locationTableBody.empty();
  
            results.forEach(item => {
              const personnelRow = `
                <tr>
                  <td class="align-middle text-nowrap">${item.firstName}, ${item.lastName}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${item.departmentName}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${item.locationName}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${item.email}</td>
                  <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${item.id}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${item.id}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `;
              const departmentRow = `
                <tr>
                  <td class="align-middle text-nowrap">${item.departmentName}</td>
                  <td class="align-middle text-nowrap d-none d-md-table-cell">${item.locationName}</td>
                  <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${item.departmentID}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${item.departmentID}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `;
              const locationRow = `
                <tr>
                  <td class="align-middle text-nowrap">${item.locationName}</td>
                  <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${item.locationID}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${item.locationID}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
              `;
              personnelTableBody.append(personnelRow);
              departmentTableBody.append(departmentRow);
              locationTableBody.append(locationRow);
            });
          } else {
            console.error('Failed to fetch search results:', response.status.description);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error fetching search results:', textStatus, errorThrown, jqXHR.responseText);
        }
      });
    }
  
    populatePersonnelTable();
  
    $("#searchInp").on("keyup", function () {
      const query = $(this).val();
      handleSearch(query);
    });

    $("#refreshBtn").click(function () {
      if ($("#personnelBtn").hasClass("active")) {
        populatePersonnelTable();
      } else if ($("#departmentsBtn").hasClass("active")) {
        populateDepartmentTable();
      } else if ($("#locationsBtn").hasClass("active")) {
        populateLocationTable();
      }
    });
  
    $("#departmentsBtn").click(function () {
      populateDepartmentTable();
    });
  
    $("#locationsBtn").click(function () {
      populateLocationTable();
    });
  });
