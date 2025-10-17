document.addEventListener('DOMContentLoaded', function() {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const dateInput = document.getElementById('menuDate');
    const dishCountRadios = document.querySelectorAll('input[name="numDishes"]');
    const dishInputsContainer = document.getElementById('dishInputsContainer');
    const drinkCountRadios = document.querySelectorAll('input[name="numDrinks"]');
    const drinkInputsContainer = document.getElementById('drinkInputsContainer');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const menuOutput = document.getElementById('menuOutput');
    const historyContainer = document.getElementById('historyContainer');
    
    let menuHistory = [];

    // --- FUNCIONES DINÁMICAS PARA INPUTS ---

    function createInputFields(count, container, placeholderPrefix) {
        container.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'input-group';
            div.innerHTML = `
                <span>${i}.</span>
                <input type="text" class="${placeholderPrefix.toLowerCase()}" placeholder="${placeholderPrefix} ${i}">
            `;
            container.appendChild(div);
        }
    }

    function updateDishInputs() {
        const count = document.querySelector('input[name="numDishes"]:checked').value;
        createInputFields(count, dishInputsContainer, 'Platillo');
    }

    function updateDrinkInputs() {
        const count = document.querySelector('input[name="numDrinks"]:checked').value;
        createInputFields(count, drinkInputsContainer, 'Bebida');
    }

    // --- LÓGICA DE HISTORIAL ---

    function saveMenuToHistory(menuData) {
        menuHistory = menuHistory.filter(menu => menu.date !== menuData.date);
        menuHistory.unshift(menuData);
        if (menuHistory.length > 10) {
            menuHistory.pop();
        }
        localStorage.setItem('menuHistorySolarSur', JSON.stringify(menuHistory));
        renderHistory();
    }

    // **NUEVA FUNCIÓN PARA ELIMINAR**
    function deleteMenuFromHistory(event, index) {
        event.stopPropagation(); // Evita que se dispare el evento de cargar el menú
        menuHistory.splice(index, 1); // Elimina el elemento del array
        localStorage.setItem('menuHistorySolarSur', JSON.stringify(menuHistory)); // Actualiza el almacenamiento
        renderHistory(); // Vuelve a dibujar el historial
    }

    function renderHistory() {
        historyContainer.innerHTML = '';
        if (menuHistory.length === 0) {
            historyContainer.innerHTML = '<p>No hay menús guardados.</p>';
            return;
        }
        menuHistory.forEach((menu, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            // **HTML ACTUALIZADO CON EL BOTÓN DE ELIMINAR**
            item.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-date">${menu.date}</div>
                    <div class="history-item-dishes">${menu.dishes.join(', ')}</div>
                </div>
                <button class="delete-btn" title="Eliminar menú">🗑️</button>
            `;
            // Listener para cargar el menú al hacer clic en el contenedor
            item.querySelector('.history-item-content').addEventListener('click', () => loadMenuFromHistory(index));
            
            // Listener para el nuevo botón de eliminar
            item.querySelector('.delete-btn').addEventListener('click', (event) => deleteMenuFromHistory(event, index));

            historyContainer.appendChild(item);
        });
    }

    function loadMenuFromHistory(index) {
        const menu = menuHistory[index];
        dateInput.value = menu.date;
        
        document.getElementById(`dishes${menu.dishes.length}`).checked = true;
        updateDishInputs();
        const dishInputs = dishInputsContainer.querySelectorAll('.platillo');
        dishInputs.forEach((input, i) => input.value = menu.dishes[i] || '');

        document.getElementById(`drinks${menu.drinks.length}`).checked = true;
        updateDrinkInputs();
        const drinkInputs = drinkInputsContainer.querySelectorAll('.bebida');
        drinkInputs.forEach((input, i) => input.value = menu.drinks[i] || '');
    }

    function loadHistoryFromStorage() {
        const storedHistory = localStorage.getItem('menuHistorySolarSur');
        if (storedHistory) {
            menuHistory = JSON.parse(storedHistory);
            renderHistory();
        }
    }

    // --- GENERACIÓN DEL MENÚ ---
    generateBtn.addEventListener('click', function() {
        if (!dateInput.value) {
            alert('Por favor, selecciona una fecha.');
            return;
        }
        const date = new Date(dateInput.value + 'T12:00:00');
        const dayName = date.toLocaleDateString('es-MX', { weekday: 'long' });
        const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        const greetings = {
            "Lunes": { emoji: "💪", text: "¡Feliz inicio de semana!" },
            "Martes": { emoji: "😋", text: "¡Feliz martes con sazón!" },
            "Miércoles": { emoji: "⭐", text: "¡Feliz ombligo de semana!" },
            "Jueves": { emoji: "🥘", text: "¡Feliz jueves pozolero!" },
            "Viernes": { emoji: "🎉", text: "¡Feliz viernes sabroso!" },
            "Sábado": { emoji: "☀️", text: "¡Feliz sábado para disfrutar!" },
            "Domingo": { emoji: "👨‍👩‍👧‍👦", text: "¡Feliz domingo familiar!" }
        };
        const greeting = greetings[capitalizedDayName] || { emoji: "☀️", text: `¡Feliz ${capitalizedDayName}!` };

        const dishInputs = Array.from(document.querySelectorAll('#dishInputsContainer .platillo'));
        const dishes = dishInputs.map(input => input.value.trim()).filter(Boolean);
        if (dishes.length === 0) {
            alert('Por favor, ingresa al menos un platillo.');
            return;
        }
        const dishesList = dishes.map(d => `✅ ${d}`).join('\n');

        const drinkInputs = Array.from(document.querySelectorAll('#drinkInputsContainer .bebida'));
        const drinks = drinkInputs.map(input => input.value.trim()).filter(Boolean);
        let drinkSection = '';
        if (drinks.length > 0) {
            const drinkList = drinks.map(d => `💜 ${d}`).join('\n');
            drinkSection = `\n🥤 *Para tomar:*\n${drinkList}`;
        }

        const finalMenu = `¡Buen día! ${greeting.emoji} ¡${greeting.text}! ${capitalizedDayName === 'Viernes' ? '🎉' : ''}
El día perfecto para celebrar con los platillos más deliciosos de Guerrero 💫
Te presentamos nuestro menú, preparado con el sazón tradicional:

🍽 *Menú del ${capitalizedDayName}:*
${dishesList}
${drinkSection}

📞 *¡Realiza tu pedido!*
📍 Coyuca de Benítez (zona centro y colonias cercanas)
🛵 Servicio a domicilio
📲 781 100 3796

¡Haz de tu ${dayName} el mejor día de la semana lleno de auténtico sabor! 😊🎉`;
        
        menuOutput.value = finalMenu;

        const menuData = { date: dateInput.value, dishes, drinks };
        saveMenuToHistory(menuData);
    });

    // --- FUNCIÓN DE COPIAR ---
    copyBtn.addEventListener('click', function() {
        if (menuOutput.value === '') {
            alert('Primero genera un menú para poder copiarlo.');
            return;
        }
        navigator.clipboard.writeText(menuOutput.value).then(() => {
            copyBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                copyBtn.textContent = '📋 Copiar Texto';
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    });

    // --- INICIALIZACIÓN ---
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const todayLocal = new Date(today.getTime() - (offset * 60 * 1000));
    dateInput.value = todayLocal.toISOString().split('T')[0];

    dishCountRadios.forEach(radio => radio.addEventListener('change', updateDishInputs));
    drinkCountRadios.forEach(radio => radio.addEventListener('change', updateDrinkInputs));
    
    updateDishInputs();
    updateDrinkInputs();
    loadHistoryFromStorage();
    
});

