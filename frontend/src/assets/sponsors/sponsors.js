const importAll = import.meta.glob('./*.png', { eager: true });

const sponsors = Object.values(importAll);

export default sponsors;