const url = "http://grossebeut.eu:3000/api";

class Cart {
    constructor() {
        this.cart = [];
    }

    init() {
        this.getCartFromLocalStorage();
        if (this.cart.length === 0) this.draw();

        fetch(url + "/products")
            .then(res => res.json())
            .then(originalProducts => {
                this.originalProducts = originalProducts;
                this.createProductListForCart();
                this.draw();
            });
    }

    draw() {
        let productList = document.getElementById("cart__items");
        productList.innerHTML = '';

        if (this.cart.length === 0) {
            productList.appendChild(createElementFromHTML("<p>Votre panier est vide!</p>"));
            document.getElementById("totalQuantity").innerText = 0;
            document.getElementById("totalPrice").innerText = 0;
            return;
        }

        this.cart.forEach(product => {
            let productElement = this.createProduct(product);

            productElement.addEventListener("click", e => {
                if (e.target.className === "deleteItem") {
                    this.removeProduct(product);
                    productElement.remove();
                }
                else if (e.target.className === "itemQuantity") {
                    this.setProductQuantity({ id: product.id, color: product.color, quantity: e.target.value });
                }
            })

            productList.appendChild(productElement);
        });

        document.getElementById("totalQuantity").innerText = this.getTotalQuantity();
        document.getElementById("totalPrice").innerText = this.getTotalPrice();
    }

    getTotalQuantity() {
        let totalQuantity = 0;

        this.cart.forEach(product => {
            totalQuantity += Number(product.quantity);
        });

        return totalQuantity;
    }

    getTotalPrice() {
        let totalPrice = 0;

        this.cart.forEach(product => {
            totalPrice += Number(product.price) * Number(product.quantity);
        });

        return totalPrice;
    }

    createProductListForCart() {
        if (!this.cart) return;

        this.cart.forEach((product, index) => {
            let originalProduct = this.originalProducts.filter(originalProduct => originalProduct._id === product.id)[0];
            this.cart[index] = {
                ...product,
                imageUrl: originalProduct.imageUrl,
                altTxt: originalProduct.altTxt,
                name: originalProduct.name,
                price: originalProduct.price
            };
        });

        this.cart = this.cart.sort((a, b) => a.name.localeCompare(b.name) >= 0 ? 1 : -1);
    }

    getCartFromLocalStorage() {
        if (!(this.cart = JSON.parse(localStorage.getItem("cart")))) {
            this.cart = [];
        }
    }

    setProductQuantity({ id, color, quantity }) {
        this.cart.forEach((product, index) => {
            if (product.id === id && product.color === color) {
                this.cart[index].quantity = quantity;
            }
        });

        this.writeCartToLocalStorage();
    }

    writeCartToLocalStorage() {
        let cleanCart = this.cart.map(product => {
            return {
                id: product.id,
                color: product.color,
                quantity: product.quantity
            }
        })
        localStorage.setItem("cart", JSON.stringify(cleanCart));
        this.draw();
    }

    removeProduct({ id, color }) {
        this.cart = this.cart.filter(product => product.id !== id | product.color !== color);
        this.writeCartToLocalStorage();
    }

    createProduct(product) {
        let html = `<article class="cart__item" data-id="${product.id}" data-color="${product.color}">
            <div class="cart__item__img">
              <img src="${product.imageUrl}" alt="${product.altTxt}" />
            </div>
            <div class="cart__item__content">
              <div class="cart__item__content__description">
                <h2>${product.name}</h2>
                <p>${product.color}</p>
                <p class="itemPrice">${product.price} ???</p>
              </div>
              <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                  <p>Qt?? :</p>
                  <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.quantity}" />
                </div>
                <div class="cart__item__content__settings__delete">
                  <p class="deleteItem">Supprimer</p>
                </div>
              </div>
            </div>
          </article>`;

        return createElementFromHTML(html);
    }
}

function isEmailValid(email) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
};

function isNameValid(word) {
    const regex = /^[a-zA-Z]*$/;
    return regex.test(word);
}

function isAddressValid(address) {
    const regex = /^[a-zA-Z0-9 ]*$/;
    return regex.test(address);
}

function setErrMsg(field, name = undefined) {
    let message = "";
    if (name) {
        message = `Votre ${name} contient un caract??re non autoris??`;
    }
    field.nextElementSibling.innerText = message;
}

// check if input is valid. if not, write an error message
function checkFields() {
    let firstName = document.querySelector("#firstName");
    let lastName = document.querySelector("#lastName");
    let address = document.querySelector("#address");
    let city = document.querySelector("#city");
    let email = document.querySelector("#email");

    (firstName["valid"] = isNameValid(firstName.value)) ? setErrMsg(firstName) : setErrMsg(firstName, "Pr??nom");
    (lastName["valid"] = isNameValid(lastName.value)) ? setErrMsg(lastName) : setErrMsg(lastName, "Nom");
    (address["valid"] = isAddressValid(address.value)) ? setErrMsg(address) : setErrMsg(address, "Adresse");
    (city["valid"] = isNameValid(city.value)) ? setErrMsg(city) : setErrMsg(city, "Ville");
    (email["valid"] = isEmailValid(email.value)) ? setErrMsg(email) : setErrMsg(email, "Email");

    return firstName.valid && lastName.valid && address.valid && city.valid && email.valid;
}

//submit form to server and redirect to confirmation page
function submitForm(cart) {
    let firstName = document.querySelector("#firstName").value;
    let lastName = document.querySelector("#lastName").value;
    let address = document.querySelector("#address").value;
    let city = document.querySelector("#city").value;
    let email = document.querySelector("#email").value;

    let products = cart.cart.map(product => product.id);
    let body = {
        contact: {
            firstName,
            lastName,
            address,
            city,
            email
        },
        products
    };

    fetch(url + "/products/order", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (!res.ok) throw "Une erreur est survenue!";
            return res.json();
        })
        .then(res => {
            location.href = "/confirmation?orderId=" + res.orderId;
        })
        .catch(alert);
}

// watch submit button click event
function form(cart) {
    let order = document.querySelector("#order");
    order.addEventListener("click", e => {
        e.preventDefault();
        if (cart.cart.length === 0) {
            alert("Votre panier est vide!");
            return;
        }
        if (checkFields()) {
            submitForm(cart);
        }
    })

}

// init cart object and call form function with cart
function main() {
    let cart = new Cart();
    cart.init();
    form(cart);
}

function createElementFromHTML(htmlString) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

main();
