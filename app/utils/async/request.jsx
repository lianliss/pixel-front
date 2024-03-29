import axios from 'axios';
import https from 'https';
import get from 'lodash/get';
import getCookie from 'utils/get-cookie';
import {IS_DEVELOP} from "const";

const TIMEOUT_CODE = 'ETIMEDOUT';
const RESET_CODE = 'ECONNRESET';
const ATTEMPTS_COUNT = 5;

export class Request {

    constructor(config = {}) {
        this.config = config;
        this.agent = new https.Agent({
            rejectUnauthorized: false
        });
        this.setInstance(config);
        this.maxAttempts = config.maxAttempts || ATTEMPTS_COUNT;
        this.delete = this.del;
        this.urlMod = config.urlMod || (url => url);
        this.paramsMod = config.paramsMod || (params => {
            const authToken = getCookie('auth-token');
            if (authToken) params['auth-token'] = authToken;
            return params;
        });
    }

    setInstance = config => {
        this.instance = axios.create(config);
        return this;
    };
    updateInstance = config => {
        this.config = {...this.config, ...config};
        this.setInstance(this.config);
        return this;
    };

    request = (rawUrl, options = {}, attempt = 1) => new Promise((fulfill, reject) => {
        (async () => {
            {
                let response;
                if (!options.method) options.method = 'get';
                const instance = get(options, 'tempInstance', this.instance);
                const customUrlMod = get(options, 'customUrlMod');
                const url = customUrlMod ? customUrlMod(rawUrl) : this.urlMod(rawUrl);
                const params = this.paramsMod(get(options, 'params', {}));
                const headers = get(options, 'headers', {});
                const telegramAuth = get(window, 'Telegram.WebApp.initData');
                if (telegramAuth) {
                    headers.TelegramAuth = telegramAuth;
                    if (IS_DEVELOP) {
                        headers.IsDevelop = true;
                    }
                }

                try {
                    response = await instance({
                        url,
                        httpsAgent: this.agent,
                        ...options,
                        params,
                        headers,
                        withCredentials: true,
                    });
                    fulfill(response.data);
                } catch (error) {
                    const isTimeout = error.code === TIMEOUT_CODE;
                    const isReset = error.code === RESET_CODE;
                    const errorData = isTimeout || isReset ? error.code : error.response;

                    // Run it again if timeout problem
                    if (isTimeout || isReset) {
                        if (attempt < 0 || attempt === this.maxAttempts) {
                            reject(errorData);
                        } else {
                            fulfill(await this.request(url, options, attempt + 1));
                        }
                    } else {
                        reject(errorData);
                    }
                }
            }
        })()
    });

    get(url, options = {}) {return this.request(url, {
        ...options,
        method: 'get',
    })};

    post(url, options = {}) {return this.request(url, {
        ...options,
        method: 'post',
    })};

    del(url, options = {}) {return this.request(url, {
        ...options,
        method: 'delete',
    })};
}

const request = new Request();

export default request;
