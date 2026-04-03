let BACKEND = 0;

const dataPeople = [
	{
		id: 24,
		name: "Вікторія",
		surname: "Клименко",
		patronymic: "",
		email: "",
		phone: "",
		position: "Developer",
		sex: 2,
		state: "Працює",
		icon: "woman.png",
		deleted: 0
	},
	{
		id: 6,
		name: "Олександр",
		surname: "Тесленко",
		patronymic: "Юрійович",
		email: "alexandr.teslenko@gmail.com",
		phone: "+380958097565",
		position: "Developer",
		sex: 1,
		state: "Працює",
		icon: "man.png",
		deleted: 0
	},
	{
		id: 9,
		name: "Віктор",
		surname: "Волков",
		patronymic: "",
		email: "v_volkov@gmail.com",
		phone: "https://t.me/my_profil",
		position: "System administrator",
		sex: 1,
		state: "Працює",
		icon: "man_3.png",
		deleted: 0
	},
	{
		id: 14,
		name: "Андрій",
		surname: "Матицин",
		patronymic: "",
		email: "andrii.matytsyn@gmail.com",
		phone: "+380111349815",
		position: "Project manager",
		sex: 1,
		state: "Працює",
		icon: "technicalsupport_man.png",
		deleted: 0
	},
	{
		id: 18,
		name: "Вікторія",
		surname: "Пашкова",
		patronymic: "Вячеславівна",
		email: "victoria.pashkova@gmail.com",
		phone: "+380111734654",
		position: "Project manager",
		sex: 2,
		state: "Працює",
		icon: "technicalsupport_woman.png",
		deleted: 0
	},
	{
		id: 16,
		name: "Володимир",
		surname: "Камінський",
		patronymic: "",
		email: "vladimir.kaminsky@gmail.com",
		phone: "+380213820002",
		position: "Supervisor",
		sex: 1,
		state: "Працює",
		icon: "man_2.png",
		deleted: 0
	},
	{
		id: 19,
		name: "Аня",
		surname: "Костоправова",
		patronymic: "",
		email: "anna.kostopravova@gmail.com",
		phone: "+380110847856",
		position: "Tester",
		sex: 2,
		state: "Працює",
		icon: "woman_2.png",
		deleted: 0
	},
	{
		id: 17,
		name: "Оля",
		surname: "Цимбаліст",
		patronymic: "",
		email: "olga.tsymbalist@gmail.com",
		phone: "+380117268694",
		position: "Project manager",
		sex: 2,
		state: "Звільнено",
		icon: "technicalsupport_woman.png",
		deleted: 1
	}
];

const statuses = {
	all: 0,
	active: 0,
	line: 0,
	work: 0,
	review: 0,
	ready: 0,
	rejected: 0
};