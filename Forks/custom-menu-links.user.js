// ==UserScript==
// @name         BrainTools: Custom Menu Links
// @namespace    brainslug.torn.utility
// @version      0.4.0
// @description  Inject custom menu links inspired by torntools
// @author       Brainslug [2323221]
// @match        https://www.torn.com/*
// @icon         https://i.imgur.com/Yl5KEht.jpg
// @updateURL    https://github.com/XeiDaMoKa/Torn-Scripts/raw/Xei/Forks/custom-menu-links.user.js
// @grant        GM_addStyle
// ==/UserScript==

/**
 * This list configures which items will be added to the menu.
 * An item may contain the following settings:
 *  label: This is the text in the link
 *  after/before: Where the link will be inserted (available choices below)
 *  target: The page you are linking to. For torn pages only the "/bazaar.php" part is needed but for external pages you need the full "https://example.com" domain.
 *  icon: For lack of a better solution yet this is plain html to be injected. The icons i used here with the exception of the bazaar were taken from the city map list.
 *  newTab: true/false defaults to false, whether to open a new tab when you click the link
 */
const customLinks = [

    { label: "Bank", after: "city", target: "/bank.php", icon: '<i class="cql-bank"></i>' },
    
    { label: "Hall", after: "city", target: "/halloffame.php", icon: '<i class="cql-city-hall"></i>' },
    
    { label: "Museum", after: "city", target: "/museum.php", icon: '<i class="cql-museum"></i>' },
    
    { label: "Dump", after: "city", target: "/dump.php", icon: '<i class="cql-dump"></i>' },
    
    { label: "Bids", after: "city", target: "/amarket.php#tab=extremely&start=0.php", icon: '<i class="cql-auction-house"></i>' },
    
    { label: "Stock", after: "city", target: "/page.php?sid=stocks", icon: '<i class="cql-stock-market"></i>' },
    
    { label: "Work", after: "city", target: "/jobs.php", icon: '<i class="cql-player-committee"></i>' },
    
    { label: "Study", after: "city", target: "/education.php", icon: '<i class="cql-education"></i>' },
    
    { label: "Trade", after: "city", target: "/trade.php", icon: '<i class="cql-loan-shark"></i>' },
    
    { label: "Bazaar", after: "city", target: "/bazaar.php#/add", icon: '<i class="cql-token-shop"></i>' },
    
    { label: "Faction", after: "city", target: "/factions.php?step=your#/", icon: '<i class="cql-donator-house"></i>' },
    
    { label: "Jail", after: "city", target: "/jailview.php", icon: '<i class="cql-jail"></i>' },
    
    { label: "Gyms", after: "city", target: "/gym.php", icon: '<i class="cql-gym"></i>' },
    
    { label: "Travel", after: "city", target: "/travelagency.php", icon: '<i class="cql-travel-agency"></i>' },
    
    { label: "Bounty", after: "city", target: "/bounties.php#!p=main", icon: '<i class="cql-big-als-gun-shop "></i>' },
    
    { label: "News", after: "city", target: "/newspaper.php", icon: '<i class="cql-messaging-inc"></i>' },
    
    { label: "Hosp", after: "city", target: "/hospitalview.php", icon: '<i class="cql-hospital"></i>' },
    
    { label: "Casino", after: "city", target: "/casino.php", icon: '<i class="cql-casino"></i>' },
    
    { label: "Mission", after: "city", target: "/loader.php?sid=missions", icon: '<i class="cql-missions"></i>' },
    
    { label: "Market", after: "city", target: "/imarket.php#/p=market&cat=plushies", icon: '<i class="cql-item-market"></i>' },
    
    { label: "Home", after: "city", target: "/properties.php#/p=yourProperties", icon: '<i class="cql-your-property "></i>' },
    
    { label: "Forum", after: "city", target: "/forums.php", icon: '<i class="cql-visitor-center"></i>' },
    
    { label: "Races", after: "city", target: "/loader.php?sid=racing", icon: '<i class="cql-raceway"></i>' },
    
    { label: "Crimes", after: "city", target: "/crimes.php", icon: '<i class="cql-church"></i>' },
    
    { label: "Items", after: "city", target: "/item.php", icon: '<i class="cql-post-office"></i>' },
    
    ];
    
    const tag = tagName => (attrs={}) => {
        const elem = document.createElement(tagName);
        if ( !! attrs.text) elem.innerText = attrs.text;
        if ( !! attrs.html) elem.innerHTML = attrs.html;
        if (tagName == 'a') {
            if ( !! attrs.href) elem.href = attrs.href;
            if ( !! attrs.target) elem.target = attrs.target;
        }
        if ( !! attrs.cls) {
            if (Array.isArray(attrs.cls)) attrs.cls.forEach(c => elem.classList.add(c));
            else elem.classList.add(attrs.cls);
        }
        if ( !! attrs.children) attrs.children.forEach(child => elem.append(child));
        return elem;
    };
    
    const watchNav = (linkname, timeout=50, retries=50) => new Promise((resolve, reject) => {
        let count = 0;
        const interval = setInterval(() => {
            const $elem = unsafeWindow.document['querySelector']('#nav-'+linkname);
            if ( !! $elem) {
                clearInterval(interval);
                return resolve($elem);
            }
            if (count >= retries) {
                clearInterval(interval);
                console.error(`Max retries(${retries}) reached for "#nav-${linkname}"!`);
                return reject();
            }
            count++;
        }, timeout);
    });
    
    const findClass = (cls, elem) => {
        let result = '';
        elem.classList.forEach(className => cls.test(className) && (result = className));
        if (result === '') console.error('[BrainTools]', 'class not found!', cls, elem);
        return result;
    };
    
    const injectLink = (link, elem) => elem.parentNode.insertBefore(tag`div`({
        cls: ['brain-link', findClass(/^area-desktop_/, elem)],
        children: [tag`div`({
            cls: findClass(/^area-row_/, elem.children[0]),
            children: [tag`a`({
                cls: findClass(/^desktopLink_/, elem.children[0].children[0]),
                href: link.target,
                target: !! link.newTab ? '_blank' : '_self',
                children: [
                    tag`span`({
                        cls: 'icon',
                        html:  link.icon || '',
                    }),
                    tag`span`({
                        cls: findClass(/^linkName_/, elem.children[0].children[0].children[1]),
                        text: link.label,
                    }),
                ]
            })]
        })]
    }), !! link.before ? elem : elem.nextSibling);
    
    // inject links
    customLinks.forEach(link => {
        if ((! link.before && ! link.after) || ! link.target || ! link.label) 
            return console.error('[BrainTools]', 'Bad link configured', link);
        const selector = !! link.before ? link.before : link.after;
        watchNav(selector).then(element => {
            console.info('[BrainTools]', 'Injecting custom link', link.label, link.target);
            injectLink(link, element);
        });
    });
    
    // inject styles
    GM_addStyle(`
    .brain-link a .icon {
        float: left;
        width: 34px;
        height: 23px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        margin-left: 0;
    }
    
    
    
    
    
    
    
    
    `);