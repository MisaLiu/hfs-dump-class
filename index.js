const fs = require('fs');
const inquirer = require('inquirer');
const xlsx = require('node-xlsx').default;
const slog = require('single-line-log').stdout;
const HFS = require('./hfs');
const hfs = new HFS();

init();


async function init () {
	console.log('启动中...');
	console.log('正在初始化账号信息...');
	
	await accountInit();
	
	console.log('你好 ' + hfs.user.nickName + '，欢迎使用本脚本！');
	
	hfs.examList = await hfs.getExamList();
	let inputs = await inquirer.prompt({
		type: 'rawlist',
		name: 'examList',
		message: '选择一个考试: ',
		choices: () => {
			let result = [];
			for (let exam of hfs.examList) {
				result.push({ name:exam.name, value:exam.examId });
			}
			return result;
		}
	});
	
	inquirer.prompt({
		type: 'confirm',
		name: 'confirmExam',
		message: '确认？'
	}).then((data) => {
		if (data.confirmExam) {
			startDumpExam(inputs.examList);
		} else {
			console.log('请重新运行本脚本以重新选择考试');
		}
	});
}


async function startDumpExam (examId) {
	console.log('正在获取考试数据和同学列表...');
	
	let classmates = await hfs.getClassmateList(examId);
	let myExamDetail = await hfs.getExamDetail(examId);
	let fullScores = {};
	let resultXlsx = [ ['名字'], [hfs.user.linkedStudent.studentName] ];
	let progressBar = new ProgressBar('正在获取数据');
	
	console.log('正在获取点券列表...');
	for (let item of await hfs.getShopList()) {
		if (item.name.indexOf('成绩PK') >= 0) {
			hfs.usefulItem = {
				id: item.id,
				specification: item.specifications[0].key,
				price: (item.specifications[0].pointPromotion > 0 ? item.specifications[0].pointPromotion : item.specifications[0].pointPrice)
			};
			
		} else if (item.name.indexOf('智能练习') >= 0) {
			hfs.uselessItem = {
				id: item.id,
				specification: item.specifications[0].key,
				price: (item.specifications[0].pointPromotion > 0 ? item.specifications[0].pointPromotion : item.specifications[0].pointPrice)
			};
		}
	}
	
	console.log('正在刷分...');
	await hfs.buyShopItem(hfs.uselessItem.id, hfs.uselessItem.specification, Math.ceil((hfs.usefulItem.price * classmates.length) / hfs.uselessItem.price) * -1);
	
	console.log('正在购买PK券...');
	await hfs.buyShopItem(hfs.usefulItem.id, hfs.usefulItem.specification, classmates.length);
	
	console.log('正在计算比对数据...');
	for (let paper of myExamDetail.papers) {
		resultXlsx[0].push(paper.subject);
		resultXlsx[1].push(paper.score);
		fullScores[paper.subject] = paper.manfen;
	}
	
	resultXlsx[0].push('总分');
	resultXlsx[1].push(myExamDetail.score);
	
	console.log('开始获取数据...');
	progressBar.render(1, classmates.length + 1);
	
	for (let classmate of classmates) {
		try {
			let compare = await hfs.compareExam(examId, classmate.id);
			let _resultArray = [classmate.name];
			let _scoreTotal = 0;
			
			for (let subject of compare.subjects) {
				_resultArray.push(Number((fullScores[subject.subject] * (subject.targetRatio / 100)).toFixed(2)));
				_scoreTotal += Number((fullScores[subject.subject] * (subject.targetRatio / 100)).toFixed(2));
			}
			
			_resultArray.push(_scoreTotal);
			resultXlsx.push(_resultArray);
			
		} catch (e) {
			// console.error(e);
			resultXlsx.push([classmate.name, '获取信息失败']);
		}
		
		progressBar.render(resultXlsx.length - 1, classmates.length + 1);
		if (resultXlsx.length - 1 != classmates.length + 1) await sleep(15000);
	}
	
	console.log('正在输出为表格文件...');
	fs.writeFileSync('./' + myExamDetail.name + '.xlsx', xlsx.build([{
		name: myExamDetail.name,
		data: resultXlsx
	}]));
	
	console.log('脚本运行完成！');
}



async function accountInit () {
	try {
		hfs.init(JSON.parse(fs.readFileSync('./account.json', 'utf-8')));
	} catch (e) {
		
	}
	
	if (!hfs.account.cookie || hfs.account.cookie.length <= 0) {
		await userLogin();
	}
	
	try {
		await hfs.getUserInfo();
		console.log('获取用户信息成功');
	} catch (e) {
		console.error('拉取用户信息失败，请尝试删除程序目录下 account.json 后重新登录');
		console.error(e)
	}
}

async function userLogin () {
	let inputs = await inquirer.prompt([
		{
			type: 'input',
			name: 'username',
			message: '输入好分数账号用户名: '
		},
		{
			type: 'password',
			name: 'password',
			message: '输入密码: '
		}
	]);
	
	if (inputs.username != '' && inputs.password != '') {
		try {
			fs.writeFileSync('./account.json', JSON.stringify(await hfs.login(inputs.username, inputs.password), null, 4));
			console.log('登录成功');
			
		} catch (e) {
			console.error('登录失败');
			console.error(e);
		}
		
	} else {
		console.log('未输入用户名或密码，程序即将退出...');
	}
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(() => { resolve() }, ms);
	});
}


class ProgressBar {
	constructor(description, length) {
		this.description = description || 'Progress';
		this.length = length || 25;
	}
	
	render(completed, total) {
		let percent = Number((completed / total).toFixed(4));
		let cellNum = Math.floor(this.length * percent);
		let output = this.description + ': ' + (percent * 100).toFixed(0) + '% ';
		
		for (let i = 0; i < cellNum; i++) {
			output += '█';
		}
		for (let i = 0; i < this.length - cellNum; i++) {
			output += '░';
		}
		
		slog(output + ' ' + completed + '/' + total + '\n');
	}
}