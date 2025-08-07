import { OnEventType, OnEventTypeClickableEvents, OnEventTypeContextualEvents, OnMethod, verifyAndParseOnEventType } from "../../enums/on-event-type.mjs";

export function Setor0BaseSheet(BaseClass) {
    class Setor0BaseSheet extends BaseClass {
        //#region MUST BE OVERRIDED
        get mapEvents() {
            debugger
            throw new Error("Getter 'mapEvents' must be implemented in the subclass.");
        }

        get thisDocument() {
            debugger
            throw new Error("Getter 'getThisDocument' must be implemented in the subclass.");
        }
        //#endregion 

        //#region CAN BE OVERRIDED
        async updateDocument(document, keyToUpdate, value) {
            debugger
            console.warn(`you need to implement this method (async updateDocument). There was an attempt to update field [${keyToUpdate}] with value [${value}]`);
        }
        //#endregion

        //#region GETTERS
        getMapEvents() {
            return this.mapEvents;
        }

        getThisDocument() {
            return this.thisDocument;
        }
        //#endregion

        //#region DROP EVENTS
        async _onDropActor(event, data) {
            console.log('-> On Drop Actor');
        }

        async _onDropItem(event, data) {
            console.log('-> On Drop Item');
        }
        //#endregion

        //#region LIFECYLE
        /* is called before postRenderConfiguration */
        configureSheet(html) {
            this.configureSheetEvents(html);
        }

        /* is the last event called before user interaction */
        postRenderConfiguration(html) { }
        //#endregion

        //#region CONFIGURE DEFAULT EVENTS
        configureSheetEvents(html) {
            const eventMap = [
                {
                    types: [...OnEventTypeClickableEvents, OnEventType.CHARACTERISTIC],
                    event: 'click',
                    handler: this.onActionClick
                },
                {
                    types: [OnEventType.CHANGE],
                    event: 'change',
                    handler: this.onChange
                },
                {
                    types: OnEventTypeContextualEvents,
                    event: 'contextmenu',
                    handler: this.onContextualClick
                }
            ];

            eventMap.forEach(({ types, event, handler }) => {
                types.forEach(type => {
                    const selector = `[data-action="${type}"]`;
                    html.find(selector).on(event, handler.bind(this, html));
                });
            });
        }

        async onActionClick(html, event) {
            const action = verifyAndParseOnEventType(event.currentTarget.dataset.action, OnMethod.CLICK);
            this.onEvent(action, html, event);
        }

        async onContextualClick(html, event) {
            const action = verifyAndParseOnEventType(event.currentTarget.dataset.action, OnMethod.CONTEXTUAL);
            this.onEvent(action, html, event);
        }

        async onChange(html, event) {
            this.onEvent(OnEventType.CHANGE, html, event);
        }

        async onEvent(action, html, event) {
            event.preventDefault();
            const mapEvents = this.getMapEvents();
            const characteristic = event.currentTarget.dataset.characteristic;
            const method = mapEvents[characteristic]?.[action];
            if (method) {
                method(this.getThisDocument(), event, html);
            } else {
                console.warn(`-> [${action}] não existe para: [${characteristic}]`);
            }
        }
        //#endregion
    }
    return Setor0BaseSheet;
}