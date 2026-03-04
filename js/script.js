try {
    let task_br_color = { 1: '#4878b7', 2: '#d69e2e', 3: '#805ad5', 4: '#38a169', 5: '#e53e3e' };
    let actions = { 'insert': 'створено', 'update': 'оновлено' };
    let priorities = { 1: 'Невідкладна', 2: 'Критична', 3: 'Серйозна', 4: 'Звичайна', 5: 'Незначна' };
    let types = { 1: 'Баг', 2: 'Дороботка', 3: 'Завдання', 4: 'Функціональність', 5: 'Техпідтримка' };
    let titleBtnTheme = { 'dark': 'Перейти на світлий бік', 'light': "Перейти на темний бік" };
    let mockPeople = [];
    let selectedPersonId = null;
    let selectedPersonPosition = null;
    let currentSearchTerm = '';
    let currentStatusFilter = 'all';
    let time_hide_dots_animation = 300;

    let flatpickr_config = {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        minDate: new Date(),
        mode: "single",
        conjunction: ' — ',
        locale: 'uk'
    };

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    function showError(data) {
        $('#err-messege').text(data.message);
        /*let btn = document.getElementById('btnmodalError');
        if (btn) {
            let event = new Event("click");
            btn.dispatchEvent(event);
        } else {
            console.error('btnmodalError не знайдено в DOM');
        }*/
        const modalElement = document.getElementById('modalError');
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        $('body').removeClass('light-theme dark-theme').addClass(savedTheme + '-theme');
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        const btnThemeToggle = document.getElementById("themeToggle");
        const tooltip = new bootstrap.Tooltip(btnThemeToggle);

        $('#themeToggle img').hide();
        $('#themeToggle .theme-icon-' + theme).show();
        btnThemeToggle.setAttribute("data-bs-title", titleBtnTheme[theme]);
        tooltip.setContent({ '.tooltip-inner': btnThemeToggle.getAttribute("data-bs-title") });
        clearTooltip();
    }

    function bindEvents() {
        // settings
        $('#settings').click(function () {
            $('.loader_dots').show();
            // const form = document.querySelector('#taskModal form');

            // form.reset();
            clearTooltip();
            renderPeopleTable();
            $('#peopleModal').addClass('show');
        });

        $('.header-content h1').click(function (e) {
            e.preventDefault();
            location.reload(true);
        });

        // Theme toggle
        $('#themeToggle').click(function () {
            const currentTheme = $('body').hasClass('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            $('body').removeClass('light-theme dark-theme').addClass(newTheme + '-theme');
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });

        // Create task button
        $('#createTaskBtn').click(function () {
            const form = document.querySelector('#taskModal form');

            form.reset();
            clearTooltip();
            populateFormSelects();
            if (selectedPersonId) $('#assignedTo').val(selectedPersonId);
            $('#taskModal .modal-header').find('h3').text('Створити задачу');
            $('#taskModal').addClass('show');
            $(".flatpickr").flatpickr(flatpickr_config);
            $('#taskId').val(0);
        });

        // Modal close buttons
        $('.modal-close, .modal-cancel').click(function () {
            // $('.modal').removeClass('show');
            let modal_id = $(this).data('modal-id');
            $('#' + modal_id).removeClass('show');
        });

        // Click outside modal to close
        $('.modal').click(function (e) {
            if (e.target === this) {
                // $(this).removeClass('show');
            }
        });

        // Search and filter
        /*$('#searchInput').on('input', function () {
            currentSearchTerm = $(this).val();
            renderTasks();
        });*/

        $('#statusFilter').change(function () {
            currentStatusFilter = $(this).val();
            renderTasks();
        });

        $('.btn-state').click(function () {
            currentStatusFilter = $(this).data('state');
            $('#statusFilter').val(currentStatusFilter);
            renderTasks();
        });

        // Form submissions
        $('#taskForm').submit(function (e) {
            e.preventDefault();
            submitTask();
        });

        $('#saveTaskButton').on('click', function (e) {
            e.preventDefault();
            submitTask();
        });

        // Edit task
        $('.status-select').change(function () {
            const taskId = $(this).data('task-id');
            const newStatus = $(this).val();
            updateTaskStatus(taskId, newStatus);
        });

        $('.priority-select').change(function () {
            const taskId = $(this).data('task-id');
            const newPriority = $(this).val();
            updateTaskPriority(taskId, newPriority);
        });

        $('.edit-task').click(function () {
            const taskId = $(this).data('task-id');
            openEditTaskModal(taskId);
        });

        // History task
        $('.view-history').click(function () {
            const taskId = $(this).data('task-id');
            openHistoryModal(taskId);
        });

        $(document).on('keydown', function (event) {
            // Check if the pressed key is the Escape key
            if (event.key === "Escape" || event.keyCode === 27) {
                event.preventDefault();
                $('.modal').removeClass('show');
            }
        });

        $('.task-item').on('dblclick', function () {
            const taskId = $(this).data('task-id');
            openEditTaskModal(taskId);
        });

        $('#savePersonButton').on('click', function (e) {
            e.preventDefault();
            submitPerson();
        });

        // Create person button
        $('#createPersonBtn').click(function () {
            const form = document.querySelector('#personForm');

            form.reset();
            clearTooltip();
            $('#personModal .modal-header').find('h3').text('Додати співробітника');
            $('#personModal').addClass('show');
            $('#personId').val(0);
        });

        document.getElementById('peopleModal')
            ?.addEventListener('shown.bs.modal', setPeopleModalLayout);

        window.addEventListener('resize', setPeopleModalLayout);
    }

    function renderPeopleTable() {
        const persons = $('#peopleModal .table-persons tbody');
        persons.empty();

        $.post('app/ajax.php?getPeople=true&all=1', function (data) {
            if (data.success) {
                $.each(data.result, function (index, value) {
                    let class_bg = (value.deleted == 1) ? 'bg-remove-person' : '';
                    
                    const personElement = $(`
                        <tr>
                            <th scope="row">${index + 1}</th>
                            <td class="icon ${class_bg}">
                                <div class="person-icon">
                                    <img src="./img/${value.icon}" alt="👤">
                                </div>
                            </td>
                            <td class="surname ${class_bg}">${value.surname}</td>
                            <td class="name ${class_bg}">${value.name}</td>
                            <td class="patronymic ${class_bg}">${value.patronymic}</td>
                            <td class="position ${class_bg}">${value.position}</td>
                            <td class="sex ${class_bg}" style="display:none;">${value.sex}</td>
                            <td class="deleted ${class_bg}" style="display:none;">${value.deleted}</td>
                            <td class="phone ${class_bg}">${value.phone}</td>
                            <td class="email ${class_bg}">${value.email}</td>
                            <td class="state ${class_bg}">${value.state}</td>
                            <td class="${class_bg}">
                                <button class="btn btn-secondary edit-person" data-person-id="${value.id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Редагувати" onfocusout="clearTooltip()">
                                    <img class="invert-icon" src="./img/pencil-square.svg" alt="Редагувати" />
                                </button>
                            </td>
                        </tr>
                    `).each(function () {
                        $(this).find('.edit-person').click(function () {
                            const personId = $(this).data('person-id');
                            const row = $(this).closest('tr');
                            const person = {
                                id: personId,
                                icon: row.find('.person-icon img').attr('src'),
                                surname: row.find('.surname').text().trim(),
                                name: row.find('.name').text().trim(),
                                patronymic: row.find('.patronymic').text().trim(),
                                position: row.find('.position').text().trim(),
                                sex: row.find('.sex').text().trim(),
                                deleted: row.find('.deleted').text().trim(),
                                phone: row.find('.phone').text().trim(),
                                email: row.find('.email').text().trim(),
                            };

                            // console.log({ person });
                            openEditPersonModal(person);
                        });
                    });

                    persons.append(personElement);
                });

                window.updatePeopleTableLayout = setPeopleModalLayout;
            } else {
                showError(data);
            }

            setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
        });
    }

    function setPeopleModalLayout() {
        const modal = document.getElementById('peopleModal');
        if (!modal) return;

        const header = modal.querySelector('.modal-body-header');
        const thead = modal.querySelector('.table-persons thead');
        const wrap = modal.querySelector('.modal-body-table');
        if (!wrap) return;

        const headerH = header ? header.getBoundingClientRect().height : 0;
        const theadH = thead ? thead.getBoundingClientRect().height : 0;

        // прокинемо змінні у CSS
        wrap.style.setProperty('--headerH', `${headerH}px`);
        wrap.style.setProperty('--theadH', `${theadH}px`);
    }

    function handleSearch(event) {
        event.preventDefault();
        currentSearchTerm = $('#searchInput').val().trim();
        renderTasks();
    }

    function renderPeople() {
        const peopleList = $('#peopleList');
        peopleList.empty();

        $.post('app/ajax.php?getPeople=true', function (data) {
            // console.log({ data });
            if (data.success) {
                mockPeople = data.result;

                populateFormSelects();

                // <div class="person-icon">👤</div>

                $.each(data.result, function (index, value) {
                    const personElement = $(`
                        <div class="person-item" data-person-id="${value.id}">
                            <div class="person-icon">
                                <img src="./img/${value.icon}" alt="👤">
                            </div>
                            <div class="person-item-info">
                                <div class="person-name">${value.surname} ${value.name}</div>
                                <div class="person-position">${value.position}</div>
                            </div>
                        </div>
                    `);

                    personElement.click(function () {
                        selectPerson(value.id);
                    });

                    peopleList.append(personElement);
                });
            } else {
                showError(data);
                setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
            }
        });
    }

    function selectPerson(personId) {
        currentSearchTerm = '';
        currentStatusFilter = 'all';
        selectedPersonId = personId;
        $('.loader_dots').show();

        $('.person-item').removeClass('active');
        $(`.person-item[data-person-id="${personId}"]`).addClass('active');

        const selectedPerson = mockPeople.find(p => p.id === personId);
        $('#selectedPersonName').text(`Задачі (${selectedPerson.surname} ${selectedPerson.name})`);
        $('#emptyState').hide();
        $('#taskSection').show();

        selectedPersonPosition = selectedPerson.position;

        renderTasks();
    }

    function renderTasks() {
        if (!selectedPersonId) return;
        getFilteredTasks();
    }

    function getFilteredTasks() {
        const taskList = $('#taskList');
        const noTasksDiv = $('#noTasks');
        const selectedPerson = mockPeople.find(p => p.id === selectedPersonId);

        $.post('app/ajax.php?getTasks=true', { user_id: selectedPersonId, search: currentSearchTerm, filter: currentStatusFilter, position: selectedPerson.position }, function (data) {
            // console.log({ data });
            if (data.success) {
                const filteredTasks = data.result.tasks;

                if (filteredTasks.length === 0) {
                    taskList.hide();
                    noTasksDiv.show();
                } else {
                    noTasksDiv.hide();
                    taskList.show().empty();

                    filteredTasks.forEach(task => {
                        const taskElement = createTaskElement(task);
                        taskList.append(taskElement);
                    });

                    $('[data-bs-toggle="tooltip"]').tooltip();
                }

                renderTaskStats(data.result.statuses);

                setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
            } else { showError(data); }
        });
    }

    function createTaskElement(task) {
        let br_color = task_br_color[task.status_id];
        let priority = priorities[task.priority];
        let type = types[task.type];
        let assignedTo_html = (selectedPersonPosition == 'Developer') ? '' : `<div class="task-meta-item"><span>Виконавець: </span><span class="meta">${task.assignedToName}</span></div>`;
        let responsiblePM_html = (selectedPersonPosition != 'Developer') ? '' : `<div class="task-meta-item"><span>Відповідальний: </span><span class="meta">${task.responsiblePMName}</span></div>`;
        let planned_execution_date = (task.planned_execution_date == '') ? '' : `<div class="task-meta-item"><span>Планова дата виконання: </span><span class="meta">${task.planned_execution_date}</span></div>`;
        let task_description_html = (task.description != '') ? '<div class="task-description">' + task.description + '</div>' : '';
        let task_source_html = (task.source != '') ? '<div class="task-source"><a href="' + task.source + '" target="_blank">' + task.source + '</a></div>' : '';

        return $(`
        <div class="task-item" style="border: 2px solid ${br_color};" data-task-id="${task.id}">
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-project">Проект: ${task.project}</div>
                ${task_source_html}
                ${task_description_html}
                <div class="task-meta">
                    <div class="task-meta-item"><span>№: </span><span class="meta">${task.id}</span></div>
                    <div class="task-meta-item"><span>Створено: </span><span class="meta">${task.createdAt}</span></div>
                    <div class="task-meta-item"><span>Змінено: </span><span class="meta">${task.updatedAt}</span></div>
                    <div class="task-meta-item"><span>Тип: </span><span class="meta">${type}</span></div>
                    ${responsiblePM_html}
                    ${assignedTo_html}
                    ${planned_execution_date}
                </div>
            </div>
            <div class="task-actions">
                <div class="task-actions-select">
                    <select name="status-select" class="form-select status-select" data-task-id="${task.id}">
                        <option value="1" ${task.status_id === 1 ? 'selected' : ''}>В черзі</option>
                        <option value="2" ${task.status_id === 2 ? 'selected' : ''}>В роботі</option>
                        <option value=3 ${task.status_id === 3 ? 'selected' : ''}>На перевірці</option>
                        <option value=4 ${task.status_id === 4 ? 'selected' : ''}>Готово</option>
                        <option value=5 ${task.status_id === 5 ? 'selected' : ''}>Відхилено</option>
                    </select>
                    <select name="priority-select" class="form-select priority-select" data-task-id="${task.id}">
                        <option value="1" ${task.priority === 1 ? 'selected' : ''}>Невідкладна</option>
                        <option value="2" ${task.priority === 2 ? 'selected' : ''}>Критична</option>
                        <option value=3 ${task.priority === 3 ? 'selected' : ''}>Серйозна</option>
                        <option value=4 ${task.priority === 4 ? 'selected' : ''}>Звичайна</option>
                        <option value=5 ${task.priority === 5 ? 'selected' : ''}>Незначна</option>
                    </select>
                </div>
                <button class="btn btn-secondary edit-task" data-task-id="${task.id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Редагувати дані по задачі" onfocusout="clearTooltip()">
                    <img class="invert-icon" src="./img/pencil-square.svg" alt="Редагувати" />
                </button>
                <button type="button" class="btn btn-secondary view-history" data-task-id="${task.id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Переглянути історію змін по задачі" onfocusout="clearTooltip()">
                    <img class="invert-icon" src="./img/clock-history.svg" alt="Історія" />
                </button>
            </div>
        </div>
        `).each(function () {
            $(this).on('dblclick', function () {
                const taskId = $(this).data('task-id');
                openEditTaskModal(taskId);
            });

            $(this).find('.status-select').change(function () {
                const taskId = $(this).data('task-id');
                const newStatus = $(this).val();
                updateTaskStatus(taskId, newStatus);
            });

            $(this).find('.priority-select').change(function () {
                const taskId = $(this).data('task-id');
                const newPriority = $(this).val();
                updateTaskPriority(taskId, newPriority);
            });

            $(this).find('.edit-task').click(function () {
                const taskId = $(this).data('task-id');
                openEditTaskModal(taskId);
            });

            $(this).find('.view-history').click(function () {
                const taskId = $(this).data('task-id');
                openHistoryModal(taskId);
            });
        });
    }

    function renderTaskStats(statuses) {
        // console.log({ statuses });
        const stats = $('#taskStats');
        stats.find('span.all').text(statuses.all);
        stats.find('button span').text(0);
        // stats.empty();

        stats.find('button.btn-state-active span').text(statuses.active);
        stats.find('button.btn-state-in-line span').text(statuses.line);
        stats.find('button.btn-state-work span').text(statuses.work);
        stats.find('button.btn-state-review span').text(statuses.review);
        stats.find('button.btn-state-ready span').text(statuses.ready);
        stats.find('button.btn-state-cancel span').text(statuses.rejected);

        /*const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status_name] = (acc[task.status_name] || 0) + 1;
            return acc;
        }, {});

        const statuses = tasks.reduce((acc, task) => {
            acc[task.status_name] = task.status_name_lat;
            return acc;
        }, {});

        stats.append(`<span class="stat-badge">Всього: ${tasks.length}</span>`);

        Object.entries(statusCounts).forEach(([status, count]) => {
            stats.append(`<span class="stat-badge ${statuses[status]}">${status}: ${count}</span>`);
        });*/
    }

    function populateFormSelects() {
        const selects = ['#responsiblePM', '#assignedTo'];

        selects.forEach(selector => {
            const select = $(selector);
            select.empty();

            switch (selector) {
                case "#responsiblePM":
                    select.append(`<option value="" disabled selected>-- Оберіть відповідального --</option>`);
                    break;
                case "#assignedTo":
                    select.append(`<option value="" disabled selected>-- Оберіть виконавця --</option>`);
                    break;
            }

            mockPeople.forEach(person => {
                switch (selector) {
                    case "#responsiblePM":
                        if (person.position == 'Project manager' || person.position == 'Tester') {
                            select.append(`<option value="${person.id}">${person.surname} ${person.name}</option>`);
                        }
                        break;
                    case "#assignedTo":
                        if (person.position == 'Developer' || person.position == 'System administrator') {
                            select.append(`<option value="${person.id}">${person.surname} ${person.name}</option>`);
                        }
                        break;
                }
            });
        });
    }

    function submitTask() {
        const formData = new FormData(document.getElementById('taskForm'));
        var taskId = $('#taskId').val();
        $('.loader_dots').show();
        $('#saveTaskButton').prop('disabled', true);

        const notification = taskId && taskId !== ''
            ? 'Задачу оновлено успішно'
            : 'Задачу створено успішно';

        fetch('app/ajax.php?submitTask=true', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                $('#saveTaskButton').prop('disabled', false);
                setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);

                if (data.success) {
                    showNotification(notification);
                    $('#taskModal').removeClass('show');
                    $('#taskForm')[0].reset();
                    renderTasks();
                } else {
                    showError(data);
                }
            })
            .catch(err => {
                showError('Помилка:' + err);
                setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
            });
    }

    function updateTaskStatus(taskId, newStatus) {
        $.post('app/ajax.php?setTaskStatus=true', { taskId, newStatus }, function (data) {
            if (data.success) {
                renderTasks();
                showNotification(`Статус задачі змінено`);
            } else { showError(data); }
        });
    }

    function updateTaskPriority(taskId, newPriority) {
        $.post('app/ajax.php?setTaskPriority=true', { taskId, newPriority }, function (data) {
            if (data.success) {
                renderTasks();
                showNotification(`Пріоритет задачі змінено`);
            } else { showError(data); }
        });
    }

    function openEditTaskModal(taskId) {
        $('.loader_dots').show();
        clearTooltip()

        $.post('app/ajax.php?getTask=true', { taskId }, function (data) {
            if (data.success) {
                var task = data.result;
                // console.log({ task });

                $('#taskModal .modal-header').find('h3').text('Редагувати задачу №' + task.id);
                $('#taskId').val(task.id);
                $('#taskTitle').val(task.title);
                $('#projectName').val(task.project);
                $('#taskSource').val(task.source);
                $('#taskDescription').val(task.description);
                $('#taskStatus').val(task.status_id);
                $('#taskPriority').val(task.priority);
                $('#taskType').val(task.type);
                $('#responsiblePM').val(task.responsiblePM);
                $('#assignedTo').val(task.assignedTo);
                $('#taskEstimateHour').val(task.estimate.hours);
                $('#taskEstimateMinute').val(task.estimate.minutes);

                $('#taskModal').addClass('show');
                $(".flatpickr").flatpickr(flatpickr_config);
                $('#taskPlannedExecutionDate').val(task.planned_execution_date);
            } else { showError(data); }

            setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
        });
    }

    function openHistoryModal(taskId) {
        clearTooltip();
        if (!taskId) return;
        $('.loader_dots').show();
        // const endDate = new Date().toISOString().split('T')[0];
        // const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // $('#startDate').val(startDate);
        // $('#endDate').val(endDate);

        $.post('app/ajax.php?getTaskHistory=true', { taskId }, function (data) {
            if (data.success) {
                var data = data.result;

                $('#historyModal .modal-header h3').text(`Історія змін по задачі №${taskId}`);
                $('#historyModal').addClass('show');
                renderHistory(data);
            } else { showError(data); }
        });
    }

    function renderHistory(taskHistoryData) {
        const historyList = $('#historyList');
        historyList.empty();

        if (taskHistoryData.length === 0) {
            historyList.append('<div class="history-item">Історії змін по задачі не знайдено</div>');
            return;
        }

        taskHistoryData.forEach(item => {
            let action = actions[item.action];
            let priority = priorities[item.priority];

            const historyElement = $(`
                <div class="history-item">
                    <div class="history-item-info">
                        <div class="history-action"><span>Дія:</span>${action}</div>
                        <div class="history-timestamp"><span>Дата та час зміни:</span>${item.datetime}</div>
                    </div>
                    <div class="history-data"><span>Назва:</span>${item.title}</div>
                    <div class="history-data"><span>Назва проекту:</span>${item.project}</div>
                    <div class="history-data"><span>Відповідальний:</span>${item.responsiblePMName}</div>
                    <div class="history-data"><span>Виконавець:</span>${item.assignedToName}</div>
                    <div class="history-data"><span>Статус:</span>${item.status_name}</div>
                    <div class="history-data"><span>Пріоритет:</span>${priority}</div>
                    <div class="history-data"><span>Посилання на таск:</span>${item.source}</div>
                    <div class="history-data"><span>Опис:</span>${item.description}</div>
                </div>
            `);

            historyList.append(historyElement);
        });

        setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
    }

    function showNotification(message) {
        const notification = $(`<div class="notification">${message}</div>`);
        $('body').append(notification);

        setTimeout(() => {
            notification.fadeOut(300, function () {
                $(this).remove();
            });
        }, 3000);
    }

    function clearTooltip() {
        $('.tooltip').removeClass('show');
        $('.tooltip').hide();
    }

    function openEditPersonModal(person) {
        $('.loader_dots').show();
        clearTooltip();

        var header_text = (person.sex == 1) ? 'Співробітник' : 'Співробітниця';
        $('#personModal .modal-header').find('h3').text(header_text);
        $('#personForm #personId').val(person.id);
        $('#personForm #personSurname').val(person.surname);
        $('#personForm #personName').val(person.name);
        $('#personForm #personPatronymic').val(person.patronymic);
        $('#personForm #personPosition').val(person.position);
        $('#personForm #personSex').val(person.sex);
        $('#personForm #personState').val(person.deleted);
        $('#personForm #personPhone').val(person.phone);
        $('#personForm #personEmail').val(person.email);

        $('#personModal').addClass('show');
        setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
    }

    function submitPerson() {
        const formData = new FormData(document.getElementById('personForm'));
        var personId = $('#personId').val();
        $('.loader_dots').show();
        $('#savePersonButton').prop('disabled', true);

        const notification = personId && personId !== ''
            ? 'Дані оновлено успішно'
            : 'Створено успішно';

        fetch('app/ajax.php?submitPerson=true', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                $('#savePersonButton').prop('disabled', false);
                setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);

                if (data.success) {
                    showNotification(notification);
                    $('#personModal').removeClass('show');
                    $('#personForm')[0].reset();
                    renderTasks();
                } else {
                    showError(data);
                }

                renderPeopleTable();
                renderPeople();
            })
            .catch(err => {
                showError('Помилка:' + err);
                setTimeout(function () { $('.loader_dots').hide(); }, time_hide_dots_animation);
            });
    }

    // Add keyframe animation for notifications
    $('<style>').prop('type', 'text/css').html(`
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `).appendTo('head');

} catch (e) {
    console.log('+++ Exeption +++', e);
}