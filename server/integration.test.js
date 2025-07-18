"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require('supertest');
const app = require('./index').default;
describe('PDF Generation API', () => {
    it('should return 400 for missing markdown', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .post('/api/generate-pdf')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    }));
    it('should return PDF for valid markdown', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .post('/api/generate-pdf')
            .send({ markdown: '# Hello World' });
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('application/pdf');
        expect(res.body).toBeDefined();
    }));
});
