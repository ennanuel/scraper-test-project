const pageTitle = document.getElementById("page-title");
const searchInput = document.getElementById("search");
const pageSection = document.getElementById("page-section");

const convertToNumber = (stringValue) => /nan/i.test(Number(stringValue)) ? 1 : Number(stringValue);

function setPageTitle(text) {
    pageTitle.text = text;
};

function setInputValue(value) {
    searchInput.value = value;
}

function getParamsValue() {
    // The product values are passed as params when the form is submitted, this fetches them

    const urlParams = new URLSearchParams(window.location.search);
    const searchValue = urlParams.get('search');
    const pageValue = urlParams.get("page");
    return { searchValue, pageValue };
};

function clearView() { 
    while (pageSection.firstChild) {
        pageSection.removeChild(pageSection.firstChild);
    }
};

function getRatingPercentage(rating) {
    const matchedRatingNumbers = rating?.match(/^\d+.{0,1}\d+/);
    const starNumbers = matchedRatingNumbers ? convertToNumber(matchedRatingNumbers[0]) : 0;
    const percentage = ((starNumbers / 5) * 100).toFixed(2);
    return percentage;
}

function generateStars(rating) {
    const container = document.createElement("div");
    container.setAttribute("class", "stars flex");

    const starContainer = document.createElement("span");
    starContainer.setAttribute("class", "flex items-center star-container");

    const percentage = getRatingPercentage(rating);
    starContainer.style.backgroundImage = `linear-gradient(90deg, #FB8500 0%, #FB8500 ${percentage}%, gray ${percentage}%, gray 100%)`;

    for (let i = 1; i < 5; i++) {
        const star = document.createElement("i");
        star.setAttribute("class", "fa fa-star");
        starContainer.appendChild(star);
    };

    container.appendChild(starContainer);
    return container;
}

function createProductElement(product, index) {
    const productContainer = document.createElement('li');
    productContainer.setAttribute("title", product.title);
    productContainer.setAttribute('class', 'flex flex-col border justify-between animate-fadein');
    productContainer.setAttribute("data-delay", index / 20 + 's');

    const productImage = document.createElement("img");
    productImage.setAttribute("src", product.image);
    productImage.setAttribute("class", "w-full square");
    productImage.setAttribute("alt", product.title);

    productContainer.appendChild(productImage);

    const productDetails = document.createElement("div");
    productDetails.setAttribute("class", "product-details flex flex-col");

    const productTitle = document.createElement("h2");
    productTitle.innerText = product.title.length > 20 ? `${product.title.substr(0, 20)}...` : product.title;

    productDetails.appendChild(productTitle);

    const productReview = document.createElement("div");
    productReview.setAttribute("class", "flex review justify-between");

    const productStars = generateStars(product.rating);
    
    productReview.appendChild(productStars);

    const productNumberOfReveiews = document.createElement("span");
    productNumberOfReveiews.innerText = `${product.reviewers || 0} Reveiews`;
    productNumberOfReveiews.setAttribute("class", "no-of-reviews");

    productReview.appendChild(productNumberOfReveiews);
    productDetails.appendChild(productReview);
    productContainer.appendChild(productDetails);
    return productContainer;
};

function displayProducts(products) { 
    const productsContainer = document.createElement("ul");
    productsContainer.setAttribute("id", "search-results");
    productsContainer.setAttribute("class", "w-full");

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productElement = createProductElement(product);
        productsContainer.append(productElement)
    }

    pageSection.appendChild(productsContainer);
};

function displayText(searchValue) {
    const paragraph = document.createElement("p");
    paragraph.setAttribute("id", "result-text");
    paragraph.innerText = 'Showing results for ';

    const spanText = document.createElement("span");
    spanText.innerText = searchValue;

    paragraph.appendChild(spanText);
    pageSection.appendChild(paragraph);
};

function displayErrorMessage(message) { 
    clearView();
    const container = document.createElement("div");
    container.setAttribute("class", "error flex flex-col flex items-center justify-center");
    
    const icon = document.createElement("i");
    icon.setAttribute("class", "error-icon fa fa-exclamation-triangle");
    container.appendChild(icon);

    const title = document.createElement("h2");
    title.innerText = message;
    title.setAttribute("class", "error-text");
    container.appendChild(title);

    const button = document.createElement("button");
    button.innerText = "Try Again";
    button.setAttribute("class", "retry-btn");
    button.addEventListener("click", search);
    container.appendChild(button);

    pageSection.appendChild(container);
};

function displayLoadingMessage() { 
    clearView();
    const container = document.createElement("div");
    container.setAttribute("class", "loading flex flex-col flex items-center justify-center");
    const loadingWheel = document.createElement("div");
    loadingWheel.setAttribute("class", "loading-wheel");
    container.appendChild(loadingWheel);

    const loadingText = document.createElement("h2");
    loadingText.innerText = "Searching for products...";
    loadingText.setAttribute("class", "loading-text");

    container.appendChild(loadingText);
    pageSection.appendChild(container);
};

function displayNothingFoundMessage() { 
    clearView();
    const container = document.createElement("div");
    container.setAttribute("class", "error flex flex-col flex items-center justify-center");
    const icon = document.createElement("i");
    icon.setAttribute("class", "error-icon fa fa-eye-slash");
    container.appendChild(icon);

    const message = document.createElement("h2");
    message.innerText = "Nothing was found";
    message.setAttribute("class", "error-text");

    container.appendChild(message);
    pageSection.appendChild(container);
};

function displayPagination({ pagination, searchValue, pageValue }) { 
    const paginationNum = convertToNumber(pagination);
    const pagesContainer = document.createElement("ul");
    pagesContainer.setAttribute("id", "pagination");
    pagesContainer.setAttribute("class", "flex items-center justify-center");

    for (let i = 1; i <= paginationNum; i++) {
        const pageLinkContainer = document.createElement("li");
        const pageLink = document.createElement("a");
        pageLink.innerText = i;
        pageLink.setAttribute("class", `border flex items-center justify-center ${pageValue == i || (!pageValue && i == 1) ? 'active' : ''}`);
        pageLink.setAttribute("href", `/search.html?search=${searchValue}&page=${i}`);
        pageLinkContainer.appendChild(pageLink);
        pagesContainer.appendChild(pageLinkContainer);
    }

    pageSection.appendChild(pagesContainer)
};

async function search() {
    const { pageValue, searchValue } = getParamsValue();
    displayLoadingMessage();

    try {
        setPageTitle(`Searching for ${searchValue}...`);
        setInputValue(searchValue);

        const pageNumber = convertToNumber(pageValue);
        const response = await fetch(`/v1/api/search/${searchValue}/${pageNumber}`);
        const result = await response.json();

        if (response.status !== 200) throw result;
        const { page, totalPages, products } = result;

        if (products.length < 1) return displayNothingFoundMessage();

        clearView();
        displayText(searchValue);
        displayProducts(products);
        displayPagination({ pagination: totalPages, pageValue: page, searchValue });
        setPageTitle(`Showing results for ${searchValue}.`);
    } catch (error) {
        console.error(error);
        setPageTitle(`Search for ${searchValue} failed!`);
        displayErrorMessage(error.message);
    }
}

search();