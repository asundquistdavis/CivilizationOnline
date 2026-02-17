import { Component, ComponentProps, WindowTemplate } from "./component";
import '../styles/ast.css';
import { ToolBarPack } from "./toolBar";
import { StaticCivilization } from "../game/game";

interface ASTWindowProps extends ComponentProps {
    window?:WindowTemplate;

}

export class ASTWindow extends Component<ASTWindowProps> {

    protected _props: ASTWindowProps;
    protected _dependencyList: { listenerId: string; action: () => void; id?: string; }[] = [
    ];
    pack:ToolBarPack = {id:this.id, text:'AST', on:()=>this.props.window.show(), off:()=>this.props.window.hide()};
    render(): void {
        this.props.window = this.createWindow(this.parentElement, this.id, 'AST', []);
        this.props.window.wrapperElement.className += ' centered-top';
        this.props.window.onShow = (window) => {

            const tabElement = this.createTemplateElement('table', this.id, 'ast-table');
            const tableHeaderElement = this.createTemplateElement('thead', this.id, 'ast-thead');
            const tableBodyElement = this.createTemplateElement('tbody', this.id, 'ast-tbody');
            const createRow = (civilization:StaticCivilization) => {
                const rowElement = this.createTemplateElement('tr', this.id+'-'+civilization.name, 'ast-row');
                const nameCellElement = this.createTemplateElement('td', this.id+'-'+civilization.name, 'ast-name-cell', undefined, this.toTitle(civilization.name));
                nameCellElement.style.setProperty('--color', civilization.color);
                rowElement.appendChild(nameCellElement);
                const startingCell = this.createTemplateElement('td', this.id+'-'+civilization.name, 'ast-starting-cell');
                startingCell.innerHTML = '	&#10132;';
                rowElement.appendChild(startingCell);
                const createASTCell = (ageNumber:number, index:number) => {
                    const cellElement = this.createTemplateElement('td', this.id+'-'+civilization.name+'-'+index, 'ast-cell', {'age-color':(ageNumber==5? 'var(--color)':(ageNumber%2?'light':'dark'))});
                    if (ageNumber===5) {cellElement.style.setProperty('--color', civilization.color)}
                    rowElement.appendChild(cellElement);
                }
                civilization.ages.forEach(createASTCell);
                tableBodyElement.appendChild(rowElement);
            }
            this.game.getStaticAsset('civilizations').sort((civilizationA, civilizationB)=>civilizationA.ast>civilizationB.ast?1:-1).forEach(createRow);
            const scoreRowElement = this.createTemplateElement('tr', this.id, 'ast-score-row');
            const scoreRowTitleElement = this.createTemplateElement('td', this.id, 'ast-score-row-title', undefined, 'Victory Points');
            scoreRowElement.appendChild(scoreRowTitleElement);
            const createScoreRowCell = (_:any, index:number) => {
                const cellElement = this.createTemplateElement('td', this.id+'-score-'+index, 'ast-score-row-cell', undefined, ((index) * 5).toString());
                scoreRowElement.appendChild(cellElement);
            }
            Array.from(Array(16)).forEach(createScoreRowCell);
            tableBodyElement.appendChild(scoreRowElement);
            const turnRowElement = this.createTemplateElement('tr', this.id, 'ast-turn-row');
            const turnTitleElement = this.createTemplateElement('td', this.id, 'ast-turn-title', undefined, 'Turn');
            turnRowElement.appendChild(turnTitleElement);
            const createTurnCell = (_:any, index:number) => {
                const turnCellElement = this.createTemplateElement('td', this.id, 'ast-turn-cell', undefined, index.toString())
                turnRowElement.appendChild(turnCellElement);
            }
            Array.from(Array(16)).forEach(createTurnCell);
            tableBodyElement.appendChild(turnRowElement);
            tabElement.appendChild(tableBodyElement);
            this.props.window.bodyElement.appendChild(tabElement);
        }
    }

}
