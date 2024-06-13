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
  
    populatePersonnelTable();
  
  });
