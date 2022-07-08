const http = require('./http');

class HFS {
	constructor(account) {
		this.account = {};
		this.user = {};
		this.init(account);
	}
	
	init(account) {
		if (account instanceof Object) {
			this.account = account;
		}
	}
	
	login(username, password) {
		return new Promise((resolve, reject) => {
			http.post(
					'https://hfs-be.yunxiao.com/v2/users/sessions',
					{
						deviceType: 1,
						loginName: username,
						password: password,
						rememberMe: 1,
						roleType: 1
					}
				)
				.then((res) => {
					if (res.body.code === 0) {
						this.account.id = res.body.data.userId;
						this.account.studentId = res.body.data.studentId;
						this.account.token = res.body.data.fdToken;
						this.account.cookie = res.header['set-cookie'];
						
						resolve(this.account);
						
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	getUserInfo() {
		return new Promise((resolve, reject) => {
			http.get('https://hfs-be.yunxiao.com/v2/user-center/user-snapshot', null, this.account)
				.then((res) => {
					if (res.body.code === 0) {
						this.user = res.body.data;
						resolve(res.body.data);
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	getExamList() {
		return new Promise((resolve, reject) => {
			http.get('https://hfs-be.yunxiao.com/v3/exam/list?start=0&limit=99', null, this.account)
				.then((res) => {
					if (res.body.code === 0) {
						resolve(res.body.data.list);
					} else {
						reject(tes.body)
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	getExamDetail(examId) {
		return new Promise((resolve, reject) => {
			http.get('https://hfs-be.yunxiao.com/v3/exam/' + examId + '/overview', null, this.account)
				.then((res) => {
					if (res.body.code === 0) {
						resolve(res.body.data);
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	getClassmateList(examId) {
		return new Promise((resolve, reject) => {
			http.get('https://hfs-be.yunxiao.com/v2/exam/' + examId + '/class-students-info?withPkInfo=true', null, this.account)
				.then((res) => {
					if (res.body.code === 0) {
						resolve(res.body.data);
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	compareExam(examId, studentId) {
		return new Promise((resolve, reject) => {
			http.post(
					'https://hfs-be.yunxiao.com/v2/exam/' + examId + '/students/' + studentId + '/comparison',
					{
						examId: examId,
						payerType: 5,
						studentId: studentId
					},
					this.account
				)
				.then((res) => {
					if (res.body.code === 0) {
						resolve(res.body.data);
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	
	getShopList() {
		return new Promise((resolve, reject) => {
			http.get('https://hfs-be.yunxiao.com/v2/point-mall/sold-good?start=0&limit=99&from=1', null, this.account)
				.then((res) => {
					if (res.body.code === 0) {
						resolve(res.body.data);
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
	
	buyShopItem(id, specification, number = 1) {
		return new Promise((resolve, reject) => {
			http.post(
					'https://hfs-be.yunxiao.com/v2/point-mall/exchange/sold-good',
					{
						number: number,
						payThrough: 1,
						soldGood: id,
						specification: specification
					},
					this.account
				)
				.then((res) => {
					if (res.body.code === 0) {
						resolve();
					} else {
						reject(res.body);
					}
				})
				.catch((e) => { reject(e) }
			);
		});
	}
}

module.exports = HFS;