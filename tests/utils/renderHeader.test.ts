import { HomeAssistant } from "custom-card-helpers";
import { HTMLTemplateResult } from "lit";
import { createMock } from "ts-auto-mock";
import FormulaOneCard from "../../src";
import { Race } from "../../src/api/models";
import { BaseCard } from "../../src/cards/base-card";
import { ImageConstants } from "../../src/lib/constants";
import { renderHeader } from "../../src/utils";
import { MRData } from '../testdata/results.json'
import { getRenderString } from "../utils";
import * as customCardHelper from "custom-card-helpers";
import { FormulaOneCardType } from "../../src/types/formulaone-card-types";
import RestCountryClient from "../../src/api/restcountry-client";
import { Country } from "../../src/types/rest-country-types";
import * as countries from '../testdata/countries.json'

describe('Testing util file function renderHeader', () => {

    const card = createMock<BaseCard>();
    card.hass = createMock<HomeAssistant>();
    card.parent = createMock<FormulaOneCard>();
    const lastRace = <Race>MRData.RaceTable.Races[0];
    
    beforeAll(() => {
        jest.spyOn(RestCountryClient.prototype, 'GetCountriesFromLocalStorage').mockImplementation(() => {
            return countries as Country[];
        });
    });
    
    test('Calling renderHeader with image not clickable', async () => { 
        card.config.image_clickable = undefined;
        
        const result = renderHeader(card, lastRace);
        const htmlResult = getRenderString(result);

        expect(htmlResult).toMatch(`<h2 class=""><img height="25" src="${ImageConstants.FlagCDN}sg.png">&nbsp; 17 : Singapore Grand Prix</h2> <img width="100%" src="${ImageConstants.F1CDN}Circuit%20maps%2016x9/Singapore_Circuit.png.transform/7col/image.png" @action=_handleAction .actionHandler= class="" /><br>`);
    }),
    test('Calling renderHeader with clickable image ', () => { 
        card.config.image_clickable = true;
        card.config.f1_font = true;
        
        const result = renderHeader(card, lastRace);
        const htmlResult = getRenderString(result);

        expect(card.config.actions).toMatchObject({
            tap_action: {
              action: 'url',
              url_path: 'http://en.wikipedia.org/wiki/Marina_Bay_Street_Circuit'
            }
          });

        expect(htmlResult).toMatch(`<h2 class="formulaone-font"><img height="25" src="${ImageConstants.FlagCDN}sg.png">&nbsp; 17 : Singapore Grand Prix</h2> <img width="100%" src="${ImageConstants.F1CDN}Circuit%20maps%2016x9/Singapore_Circuit.png.transform/7col/image.png" @action=_handleAction .actionHandler= class=" clickable" /><br>`);
    }),
    test('Calling renderHeader with image not clickable and card countdown', async () => { 
        card.config.image_clickable = undefined;
        card.config.card_type = FormulaOneCardType.Countdown;
        
        const result = renderHeader(card, lastRace);
        const htmlResult = getRenderString(result);

        expect(htmlResult).toMatch(`<img width="100%" src="https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Singapore_Circuit.png.transform/7col/image.png" @action=_handleAction .actionHandler= class=" clickable" /><br>`);
    }),
    test('Calling renderHeader with actions', () => {

        // handleAction
        const spy = jest.spyOn(customCardHelper, 'handleAction');

        card.config.actions = {
            tap_action: {
                action: 'navigate',
                navigation_path: '/lovelace/0',
            },
            hold_action: {
                action: 'navigate',
                navigation_path: '/lovelace/1',
            },
            double_tap_action: {
                action: 'navigate',
                navigation_path: '/lovelace/2',
            }
        }
        
        const result = renderHeader(card, lastRace);

        // eslint-disable-next-line @typescript-eslint/ban-types
        const actionHandler = (result.values[1] as HTMLTemplateResult).values[2] as Function;
        actionHandler({ detail: { action: 'tap' } });
        actionHandler({ detail: { action: 'double_tap' } });
        actionHandler({ detail: { action: 'hold' } });
        
        expect(customCardHelper.handleAction).toBeCalledTimes(3);

        spy.mockClear();
    }),
    test('Calling renderHeader with actions', () => {

        // handleAction
        const spy = jest.spyOn(customCardHelper, 'handleAction');

        card.config.actions = {
            tap_action: {
                action: 'navigate',
                navigation_path: '/lovelace/0',
            },
            hold_action: {
                action: 'navigate',
                navigation_path: '/lovelace/1',
            },
            double_tap_action: {
                action: 'navigate',
                navigation_path: '/lovelace/2',
            }
        }
        
        const result = renderHeader(card, lastRace, true);

        // eslint-disable-next-line @typescript-eslint/ban-types
        const actionHandler = (result.values[1] as HTMLTemplateResult).values[2] as Function;
        actionHandler({ detail: { action: 'tap' } });
        actionHandler({ detail: { action: 'double_tap' } });
        actionHandler({ detail: { action: 'hold' } });
        
        expect(customCardHelper.handleAction).toBeCalledTimes(0);

        spy.mockClear();
    }),
    test('Calling renderHeader with config hide_tracklayout true', () => {
        card.config.hide_tracklayout = true;
        card.config.card_type = FormulaOneCardType.Results;
        const result = renderHeader(card, lastRace);
        const htmlResult = getRenderString(result);

        expect(htmlResult).toMatch(`<h2 class="formulaone-font"><img height="25" src="${ImageConstants.FlagCDN}sg.png">&nbsp; 17 : Singapore Grand Prix</h2>`);
    })
});
