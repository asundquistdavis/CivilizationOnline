


export const scantAreaIcon = (scale=5) => {

    const element = document.createElement('div');
    const svg = document.createElement('svg');
    svg.setAttribute('width', '10');
    svg.setAttribute('height', '10');
    svg.id = 'test-id';
    // element.setAttribute('viewBox', '0 0 10 100');
    svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
    const path = document.createElement('path');
    path.setAttribute('d', 'M -6 2 L -3 -2 L 3 -3 L 6 1 L 3 5 L -3 6 Z');
    svg.appendChild(path);
    element.appendChild(svg);
    const img = document.createElement('img');
    img.setAttribute('url', `#${svg.id}`);
    element.appendChild(img);
    return element

}