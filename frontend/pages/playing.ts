import Game, { GameDataListener, Player } from "../game/game";
import { MapArea, MapFeaturesList } from "../game/mapFeatures";
import { PageState, PageStateData } from "../game/state";
import { ACardsWindow } from "../gui/aCards";
import { ASTWindow } from "../gui/ast";
import { HoveredFeatureWindow } from "../gui/gui";
import { PhaseComponent } from "../gui/phase";
import { PlayersComponent } from "../gui/players";
import { SelectedComponent } from "../gui/selected";
import { ToolBar, ToolBarPack } from "../gui/toolBar";
import  '../styles/playing.css';


class PlayingStatData implements PageStateData{

    selectedPlayer:Player = null;

}

export class PlayingState extends PageState {
    _stateData:PlayingStatData = new PlayingStatData;
    getStateData(key:keyof PlayingStatData):PlayingStatData[typeof key] {return this._stateData[key]};
    setStateData(key:keyof PlayingStatData, value: PlayingStatData[typeof key]):void {
        this._stateData[key] = value;
        this.getStateDataListener(key).fire();
    }
    _stateDataListeners:Map<keyof PlayingStatData, GameDataListener>;
    getStateDataListener(key:keyof PlayingStatData):GameDataListener {return this._stateDataListeners.get(key)};
    name: string='playing';
    phase:PhaseComponent;
    ast:ASTWindow;
    aCards:ACardsWindow;
    hoveredWindow:HoveredFeatureWindow;
    async onSet(): Promise<void> {
        this.game.openActiveGame(this.game.userId, 'andrew');
        this.game.requestGameData({type:'pluralPutInstance', auth:'wild', data:{players:{
            isActive: true,
            userId: this.game.userId+'pepper',
            name: 'other player'
        }}});
        // setInterval(()=>{this.game.requestGameData({type:'state',auth:'wild',data:{phaseName:Math.round(Math.random())?'census':'pregame'}})},1000)
        this.game.requestStaticAsset('civilizations');
        this.game.requestStaticAsset('aCards');
        this.hoveredWindow = this.game.gui.registerComponent(HoveredFeatureWindow, {parentId: 'gui', id: 'hovered-feature'});
        this.phase = this.game.gui.registerComponent(PhaseComponent, {parentId:'gui', id:'phase'});
        this.ast = this.game.gui.registerComponent(ASTWindow, {parentId:'gui', id:'ast'});
        this.aCards = this.game.gui.registerComponent(ACardsWindow, {parentId: 'gui', id: 'a-cards'});
        const menuBar = this.game.gui.registerComponent(ToolBar, {parentId:'gui', id:'menu-bar', packs:[this.aCards.pack,this.ast.pack, ], justified:'right'});
        const functionsBar = this.game.gui.registerComponent(ToolBar, {parentId:'gui', id:'function-bar', packs:[
            {id:'investigate-area', text:'Investigate', subs:[
                {id:'area', text:'Areas', on:()=>this.game.investigateAreas('area', 'on'), off:()=>this.game.investigateAreas('area', 'off')},
                {id:'openSea', text:'Open Seas', on:()=>this.game.investigateAreas('openSea', 'on'), off:()=>this.game.investigateAreas('openSea', 'off')},
                {id:'volcano', text:'Volcano', on:()=>this.game.investigateAreas('volcano', 'on'), off:()=>this.game.investigateAreas('volcano', 'off')},
                {id:'floodplain', text:'Floodplain', on:()=>this.game.investigateAreas('floodplain', 'on'), off:()=>this.game.investigateAreas('floodplain', 'off')},
                {id:'city', text:'Cities', on:()=>this.game.investigateAreas('city', 'on'), off:()=>this.game.investigateAreas('city', 'off')},
            ]},
            {id:'starting-civilization', text:'Starting Civilization', on:()=>this.game.setHighlightByStartingCivilization('on'), off:()=>this.game.setHighlightByStartingCivilization('off')},
            {id:'search', text:'search for area', textInputOnChange:(featureName)=>{
                this.game.board.map.clearLayer('search-features');
                if (!featureName) {return}
                const targetFeatures = this.game.board.map.getMapFeaturesOfType('allFeature').filter(feature=>(new RegExp(featureName)).test(feature.name));
                console.log(targetFeatures);
                this.game.board.map.addLayer(targetFeatures, 'search-features');
            }}
        ]});
        this.game.gui.registerComponent(PlayersComponent, {parentId:'gui', id:'players'});
        this.game.gui.registerComponent(SelectedComponent, {parentId:'gui',id:'selected'});
    }
    onReset(): void {
        this.phase.dismount();
        this.ast.dismount();
        this.aCards.dismount();
    }
    condition(): boolean {
        return true
    }
    constructor(game:Game) {
        super(game);
        this._stateDataListeners = new Map(Object.keys(this._stateData).map(key=>([key, this.game.registerGameDataListener(key)]))) as Map<keyof PlayingStatData, GameDataListener>;
    }

}

