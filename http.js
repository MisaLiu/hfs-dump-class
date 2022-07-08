const sa = require('superagent');
const http = {
	get: function (url, data, account) {
		return new Promise((resolve, reject) => {
			let cookie = '';
			if (account && account.cookie && account.cookie.length >= 1) {
				for (let _cookie of account.cookie) {
					cookie += _cookie + ';';
				}
			}
			
			sa
				.get(url)
				.query(data)
				.accept('json')
				.set('devicetype', '1')
				.set('apptype', '1')
				.set('versionname', '4.30.4')
				.set('User-Agent', 'YX Android 9')
				.set('Cookie', cookie)
				.end((err, res) => {
					if (err) reject(err);
					resolve(res);
				}
			);
		});
	},
	
	post: function (url, data, account) {
		return new Promise((resolve, reject) => {
			let cookie = '';
			if (account && account.cookie && account.cookie.length >= 1) {
				for (let _cookie of account.cookie) {
					cookie += _cookie + ';';
				}
			}
			
			sa
				.post(url)
				.type('json')
				.send(data)
				.accept('json')
				.set('devicetype', '1')
				.set('apptype', '1')
				.set('versionname', '4.30.4')
				.set('User-Agent', 'YX Android 9')
				.set('Cookie', cookie)
				.end((err, res) => {
					if (err) reject(err);
					resolve(res);
				}
			);
		});
	}
};

module.exports = http;