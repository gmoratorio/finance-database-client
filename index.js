$(document).ready(() => {
    const location = returnLocation(window.location.pathname);
    generatePage(location);
    generateStaticEventHandlers();
});

let serverURL = "";


function generatePage(location) {
    serverURL = returnEnvironment();
    switch (location) {
        case "":
        case "index":
            generateSummaryPage('property');
            break;

        case "tenant":
        case "payment":
            generateSummaryPage(location);
            break;

        case "inspect-property":
            generateInspectProperty();
            break;
        case "edit-property":
            generateEditProperty();
            break;
    }
}

function returnEnvironment() {
    if (window.location.hostname === "localhost") {
        return "http://localhost:3000";
    } else {
        return "https://finance-db.herokuapp.com";
    }

}

function generateSummaryPage(location) {

    $.getJSON(`${serverURL}/${location}`)
        .then((data) => {
            const parent = $(`.${location}-table`);
            data.forEach((element) => {
                let viewableElement = element;
                if (location === 'property') {
                    viewableElement.viewableRent = (element.rent / 100);
                } else if (location === 'payment') {
                    viewableElement.viewableAmount = (element.amount / 100);
                }
                const source = $(`#${location}-table`).html();
                const template = Handlebars.compile(source);
                const html = template(viewableElement)
                parent.append(html);
                generateRowEventHandler(location, element.id);
            });
        })
        .catch((err) => {
            console.error(err);
        });

}

function generateInspectProperty() {
    const id = returnIdFromParams();
    $.getJSON(`${serverURL}/property/${id}`)
        .then((data) => {
            let presentedData = data;
            presentedData.viewableRent = (presentedData.rent / 100);
            const parent = $(".property-info-table");
            const source = $("#property-info-table").html();
            const template = Handlebars.compile(source);
            const html = template(presentedData);
            parent.append(html);
        })
        .then(() => {
            $.getJSON(`${serverURL}/property/${id}/tenant`)
                .then((data) => {
                    data.forEach(tenantObject => {
                        let presentedData = tenantObject;
                        const parent = $(".tenant-info-table");
                        const source = $("#tenant-info-table").html();
                        const template = Handlebars.compile(source);
                        const html = template(presentedData);
                        parent.append(html);
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .then(() => {
            $.getJSON(`${serverURL}/property/${id}/payment`)
                .then((data) => {
                    console.log(data);
                    data.forEach(paymentObject => {
                        let presentedData = paymentObject;
                        presentedData.viewableAmount = (presentedData.amount / 100);
                        const parent = $(".payment-info-table");
                        const source = $("#payment-info-table").html();
                        const template = Handlebars.compile(source);
                        const html = template(presentedData);
                        parent.append(html);
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });


}

function generateEditProperty() {
    const id = returnIdFromParams();
    $.getJSON(`${serverURL}/property/${id}`)
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

function generateStaticEventHandlers() {
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
            url: `${serverURL}/property/${id}`,
            type: "DELETE",
            success: function(result) {
                console.log(result);
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
            url: `${serverURL}/property/${id}`,
            type: "PUT",
            data: updatedProperty,
            success: function(result) {
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
            url: `${serverURL}/property/`,
            type: "POST",
            data: updatedProperty,
            success: function(result) {
                alert(`Successfully created property with ID ${result}`);
                window.location.href = `inspect-property.html?id=${result}`;
            }
        });
    });
}

function generateRowEventHandler(location, id) {
    $(`#${location}-${id}`).click(() => {
        if (location === 'property') {
            window.location.href = `inspect-property.html?id=${id}`;
        } else if (location === 'tenant') {
            $.getJSON(`${serverURL}/tenant/${id}`)
                .then((data) => {
                    window.location.href = `inspect-property.html?id=${data.property_id}`;
                });
        } else if (location === 'payment') {
            $.getJSON(`${serverURL}/payment/${id}`)
                .then((data) => {
                    return data.tenant_id;
                })
                .then((tenant_id) => {
                    $.getJSON(`${serverURL}/tenant/${tenant_id}`)
                        .then((data) => {
                            window.location.href = `inspect-property.html?id=${data.property_id}`;
                        });
                });
        }

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

function getPropertyID(location, id) {
    // var propertyID = null;





    // return propertyID;
}
