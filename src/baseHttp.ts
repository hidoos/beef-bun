import ky from "ky"
import { readEnv } from "./utils";

const config = readEnv()

export const baseHttp = ky.extend({
	hooks: {
		beforeRequest: [
			request => {
				request.headers.set('appid', config.appid!);
			}
		]
	}
});
