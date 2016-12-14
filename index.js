$(document).ready(() => {
    const location = returnLocation(window.location.pathname);
    generatePage(location);
    generateEventHandlers();
});



function generatePage(location) {
    switch (location) {
        case "":
        case "index":
            generateIndex();
            break;

        case "inspect-property":
            generateInspectProperty();
            break;
        case "edit-property":
            generateEditProperty();
            break;
    }
}

function generateIndex() {
    $.getJSON("https://finance-db.herokuapp.com/property")
        .then((data) => {
            const parent = $(".property-summary");
            data.forEach((property) => {
                const source = $("#index-property-all").html();
                const template = Handlebars.compile(source);
                const html = template(property)
                parent.append(html);
            });
        })
        .catch((err) => {
            console.error(err);
        });
}

function generateInspectProperty() {
    const id = returnIdFromParams();
    $.getJSON(`https://finance-db.herokuapp.com/property/${id}`)
        .then((data) => {
            let presentedData = data;
            presentedData.viewableRent = (presentedData.rent / 100);
            const parent = $(".property-detail");
            const source = $("#property-detail").html();
            const template = Handlebars.compile(source);
            const html = template(presentedData);
            parent.append(html);
        })
        .catch((err) => {
            console.error(err);
        });
}

function generateEditProperty(){
  const id = returnIdFromParams();
  $.getJSON(`https://finance-db.herokuapp.com/property/${id}`)
      .then((data) => {
          let presentedData = data;
          presentedData.viewableRent = (presentedData.rent / 100);
          const parent = $(".form-container");
          const source = $("#edit-property-form").html();
          const template = Handlebars.compile(source);
          const html = template(presentedData);
          parent.append(html);
      })
      .catch((err) => {
          console.error(err);
      });
}

function generateEventHandlers() {
  $("#add-new-property").click(() => {
      window.location.href = "add-property.html";
  });

    $("#back-to-summary").click(() => {
        window.location.href = "index.html";
    });

    $("#edit-property").click(() => {
        const id = returnIdFromParams();
        window.location.href = `edit-property.html?id=${id}`;
    });

    $("#delete-property").click(() => {
        const id = returnIdFromParams();
        $.ajax({
            url: `https://finance-db.herokuapp.com/property/${id}`,
            type: "DELETE",
            success: function(result) {
                alert(result);
                window.location.href = "index.html";
            }
        });
    });

    $("#cancel-property-changes").click(() => {
        const id = returnIdFromParams();
        window.location.href = `inspect-property.html?id=${id}`;
    });

    $("#save-property-changes").click(() => {
        const id = returnIdFromParams();
        const rent = $("#rent").val();
        let dbReadyRent = rent.replace("$", "");
        dbReadyRent = parseFloat(dbReadyRent) * 100;
        const updatedProperty = {
                address: $("#address").val(),
                city: $("#city").val(),
                state: $("#state").val(),
                zip: parseInt($("#zip").val()),
                unit: $("#unit").val(),
                rent: dbReadyRent
            }

            $.ajax({
              url: `https://finance-db.herokuapp.com/property/${id}`,
              type: "PUT",
              data: updatedProperty,
              success: function(result){
                alert(`Successfully updated property with ID ${id}`);
                window.location.href = `inspect-property.html?id=${id}`;
              }
            });
    });

    $("#create-new-property").click(() => {
        const id = returnIdFromParams();
        const rent = $("#rent").val();
        let dbReadyRent = rent.replace("$", "");
        dbReadyRent = parseFloat(dbReadyRent) * 100;
        const updatedProperty = {
                address: $("#address").val(),
                city: $("#city").val(),
                state: $("#state").val(),
                zip: parseInt($("#zip").val()),
                unit: $("#unit").val(),
                rent: dbReadyRent
            }
            console.log(updatedProperty);
            $.ajax({
              url: `https://finance-db.herokuapp.com/property/`,
              type: "POST",
              data: updatedProperty,
              success: function(result){
                alert(`Successfully created property with ID ${result}`);
                window.location.href = `inspect-property.html?id=${result}`;
              }
            });
    });


}


function returnLocation(pathName) {
    let location = pathName.replace("/", "");
    location = location.replace(".html", "");
    return location;
}

function returnIdFromParams() {
    const params = $.deparam.querystring();
    const id = params.id;
    return id;
}
