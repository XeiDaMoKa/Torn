// ==UserScript==
// @name         Item Sorting
// @version      1.7
// @description  Sort Items by price in all categories
// @author       XeiDaMoKa [2373510]
// @match        https://www.torn.com/item.php*
// ==/UserScript==

(function() {
    'use strict';

    // Function to sort items within a category by their value
    const sortItemsInCategory = (categoryElement) => {
        const items = Array.from(categoryElement.children);
        const itemsWithValues = items.map(item => {
            // Extract the numeric value from the item's price string
            const valueString = item.querySelector('.tt-item-price span')?.innerText.replace(/[$,]/g, '') || '0';
            const value = parseInt(valueString, 10);
            return { item, value };
        });

        // Sort the items by value in descending order
        itemsWithValues.sort((a, b) => b.value - a.value);

        // Re-append items to the category element in sorted order
        itemsWithValues.forEach(({ item }) => categoryElement.appendChild(item));
    };

    // Function to sort all categories on the page
    const sortAllCategories = () => {
        // Select all category elements
        const categoryElements = document.querySelectorAll('[id$="-items"]:not(.items-list)');
        categoryElements.forEach((categoryElement) => {
            // Sort items within this category
            sortItemsInCategory(categoryElement);
        });
    };

    // Function to initiate forced regular sorting
    const forcedRegularSorting = () => {
        setInterval(() => {
            // Re-sort all categories at regular intervals
            sortAllCategories();
        }, 500); // Interval set at 500 milliseconds
    };

    // Initial sort after a brief delay to ensure page content is loaded
    setTimeout(sortAllCategories, 500);

    // Start the forced regular sorting process
    forcedRegularSorting();
})();
