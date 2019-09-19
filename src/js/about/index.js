const getAllTeamGroups = (container) => {
    return container.querySelectorAll('.gallery .group');
}

const getAllTeamGroupButtons = (container) => {
    return container.querySelectorAll('.team-group .group');
}

const activeGroup = (container, groupId) => {
    const teamGroups = getAllTeamGroups(container);
    const teamGroupButtons = getAllTeamGroupButtons(container);

    teamGroups.forEach((elm) => {
        const elmId = elm.id;
        
        if(elmId === groupId) {
            elm.classList.add("active");
            elm.classList.add("visible-effect");
            elm.classList.add("fadeIn-ani");
        } else {
            elm.classList.remove("active");
        }
    });

    teamGroupButtons.forEach((elm) => {
        const elmId = elm.id;

        if(elmId === groupId) {
            elm.classList.add("active");
        } else {
            elm.classList.remove("active");
        }
    })
}

const handleSwitchTeamGroup = (container) => {
    const teamGroupButtons = getAllTeamGroupButtons(container);

    teamGroupButtons.forEach((item) => {
        item.addEventListener('click', () => {
            const elmId = item.getAttribute('filter');

            activeGroup(container, elmId);
        })
    })
}

const main = () => {
    const container = document.querySelector("#about-container");

    if(!container) return; 
    
    handleSwitchTeamGroup(container);
}

main();