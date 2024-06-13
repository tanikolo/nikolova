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
        url: 'libs/php/getAllLocations.php', 
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

    populatePersonnelTable();
  
    $("#departmentsBtn").click(function () {
      populateDepartmentTable();
    });

    $("#locationsBtn").click(function () {
      populateLocationTable();
    });
  });
