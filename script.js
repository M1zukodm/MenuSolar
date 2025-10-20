document.addEventListener('DOMContentLoaded', function() {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const dateInput = document.getElementById('menuDate');
    const dishCountInput = document.getElementById('dishCount');
    const applyDishCountBtn = document.getElementById('applyDishCount');
    const dishInputsContainer = document.getElementById('dishInputsContainer');
    const dishListTextarea = document.getElementById('dishList');
    const applyDishListBtn = document.getElementById('applyDishList');
    
    const drinkCountInput = document.getElementById('drinkCount');
    const applyDrinkCountBtn = document.getElementById('applyDrinkCount');
    const drinkInputsContainer = document.getElementById('drinkInputsContainer');
    const drinkListTextarea = document.getElementById('drinkList');
    const applyDrinkListBtn = document.getElementById('applyDrinkList');
    
    const generateBtn = document.getElementById('generateBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const facebookBtn = document.getElementById('facebookBtn');
    const menuOutput = document.getElementById('menuOutput');
    const historyContainer = document.getElementById('historyContainer');
    const drinkTags = document.querySelectorAll('.drink-tag');
    
    let menuHistory = [];

    // --- FUNCIONES DINÁMICAS PARA INPUTS ---

    function createInputFields(count, container, placeholderPrefix, currentValues = []) {
        container.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'input-group';
            div.innerHTML = `
                <span>${i}.</span>
                <input type="text" class="${placeholderPrefix.toLowerCase()}" 
                       placeholder="${placeholderPrefix} ${i}" 
                       value="${currentValues[i-1] || ''}">
            `;
            container.appendChild(div);
        }
    }

    function updateDishInputs() {
        const count = parseInt(dishCountInput.value);
        createInputFields(count, dishInputsContainer, 'Platillo');
    }

    function updateDrinkInputs() {
        const count = parseInt(drinkCountInput.value);
        createInputFields(count, drinkInputsContainer, 'Bebida');
    }

    // --- VALIDACIÓN DE NÚMEROS ---
    function validateCount(input, min, max) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < min) {
            alert(`El número mínimo permitido es ${min}`);
            input.value = min;
            return false;
        }
        if (value > max) {
            alert(`El número máximo permitido es ${max}`);
            input.value = max;
            return false;
        }
        return true;
    }

    // --- PROCESAMIENTO DE LISTAS PEGADAS ---
    function processPastedList(text) {
        return text.split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    function applyDishList() {
        const dishText = dishListTextarea.value.trim();
        if (!dishText) {
            alert('Por favor, pega una lista de platillos.');
            return;
        }
        
        const dishes = processPastedList(dishText);
        
        if (dishes.length === 0) {
            alert('No se encontraron platillos en la lista.');
            return;
        }
        
        if (dishes.length > 20) {
            alert(`Solo se pueden agregar máximo 20 platillos. Tu lista tiene ${dishes.length}. Se tomarán los primeros 20.`);
            dishes.splice(20);
        }
        
        dishCountInput.value = dishes.length;
        createInputFields(dishes.length, dishInputsContainer, 'Platillo', dishes);
        dishListTextarea.value = '';
        
        alert(`Se han cargado ${dishes.length} platillos.`);
    }

    function applyDrinkList() {
        const drinkText = drinkListTextarea.value.trim();
        if (!drinkText) {
            alert('Por favor, pega una lista de bebidas.');
            return;
        }
        
        const drinks = processPastedList(drinkText);
        
        if (drinks.length === 0) {
            alert('No se encontraron bebidas en la lista.');
            return;
        }
        
        if (drinks.length > 10) {
            alert(`Solo se pueden agregar máximo 10 bebidas. Tu lista tiene ${drinks.length}. Se tomarán los primeros 10.`);
            drinks.splice(10);
        }
        
        drinkCountInput.value = drinks.length;
        createInputFields(drinks.length, drinkInputsContainer, 'Bebida', drinks);
        drinkListTextarea.value = '';
        
        alert(`Se han cargado ${drinks.length} bebidas.`);
    }

    // --- BEBIDAS COMUNES ---
    drinkTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const drinkValue = this.getAttribute('data-drink');
            const currentCount = parseInt(drinkCountInput.value);
            
            if (currentCount === 0) {
                // Si no hay bebidas, establecer 1 y agregar
                drinkCountInput.value = 1;
                updateDrinkInputs();
                const firstInput = drinkInputsContainer.querySelector('.bebida');
                firstInput.value = drinkValue;
            } else {
                // Buscar un campo vacío o el último campo
                const drinkInputs = drinkInputsContainer.querySelectorAll('.bebida');
                let added = false;
                
                // Primero buscar campos vacíos
                for (let input of drinkInputs) {
                    if (!input.value.trim()) {
                        input.value = drinkValue;
                        added = true;
                        break;
                    }
                }
                
                // Si no hay campos vacíos y tenemos espacio, agregar nuevo campo
                if (!added && currentCount < 10) {
                    drinkCountInput.value = currentCount + 1;
                    updateDrinkInputs();
                    const newInputs = drinkInputsContainer.querySelectorAll('.bebida');
                    newInputs[newInputs.length - 1].value = drinkValue;
                } else if (!added) {
                    alert('Ya tienes el máximo de 10 bebidas. Elimina alguna para agregar más.');
                }
            }
        });
    });

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

    function deleteMenuFromHistory(event, index) {
        event.stopPropagation();
        menuHistory.splice(index, 1);
        localStorage.setItem('menuHistorySolarSur', JSON.stringify(menuHistory));
        renderHistory();
    }

    function renderHistory() {
        historyContainer.innerHTML = '';
        if (menuHistory.length === 0) {
            historyContainer.innerHTML = '<p>No hay menús guardados.</p>';
            return;
        }
        
        menuHistory.forEach((menu, index) => {
            const date = new Date(menu.date + 'T12:00:00');
            const dayName = date.toLocaleDateString('es-MX', { weekday: 'long' });
            const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            const formattedDate = date.toLocaleDateString('es-MX');
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-item-date">${formattedDate}</div>
                <div class="history-item-day">${capitalizedDayName}</div>
                <div class="history-item-dishes">${menu.dishes.join(', ')}</div>
                <button class="delete-btn" title="Eliminar menú">✕</button>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    loadMenuFromHistory(index);
                }
            });
            
            item.querySelector('.delete-btn').addEventListener('click', (event) => deleteMenuFromHistory(event, index));
            historyContainer.appendChild(item);
        });
    }

    function loadMenuFromHistory(index) {
        const menu = menuHistory[index];
        dateInput.value = menu.date;
        
        dishCountInput.value = menu.dishes.length;
        createInputFields(menu.dishes.length, dishInputsContainer, 'Platillo', menu.dishes);
        
        drinkCountInput.value = menu.drinks.length;
        createInputFields(menu.drinks.length, drinkInputsContainer, 'Bebida', menu.drinks);
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
        
        const dishInputs = Array.from(document.querySelectorAll('#dishInputsContainer .platillo'));
        const dishes = dishInputs.map(input => input.value.trim()).filter(Boolean);
        
        if (dishes.length === 0) {
            alert('Por favor, ingresa al menos un platillo.');
            return;
        }
        
        const drinkInputs = Array.from(document.querySelectorAll('#drinkInputsContainer .bebida'));
        const drinks = drinkInputs.map(input => input.value.trim()).filter(Boolean);
        
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

        const dishesList = dishes.map(d => `✅ ${d}`).join('\n');

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

    // --- FUNCIONES DE COPIAR ---
    whatsappBtn.addEventListener('click', function() {
        if (menuOutput.value === '') {
            alert('Primero genera un menú para poder copiarlo.');
            return;
        }
        const whatsappText = menuOutput.value;
        navigator.clipboard.writeText(whatsappText).then(() => {
            whatsappBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                whatsappBtn.textContent = '💬 Copiar para WhatsApp';
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    });

    facebookBtn.addEventListener('click', function() {
        if (menuOutput.value === '') {
            alert('Primero genera un menú para poder copiarlo.');
            return;
        }
        const facebookText = menuOutput.value.replace(/\*/g, '');
        navigator.clipboard.writeText(facebookText).then(() => {
            facebookBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                facebookBtn.textContent = '📘 Copiar para Facebook';
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    });

    // --- EVENT LISTENERS ---
    applyDishCountBtn.addEventListener('click', function() {
        if (validateCount(dishCountInput, 1, 20)) {
            updateDishInputs();
        }
    });

    applyDrinkCountBtn.addEventListener('click', function() {
        if (validateCount(drinkCountInput, 0, 10)) {
            updateDrinkInputs();
        }
    });

    applyDishListBtn.addEventListener('click', applyDishList);
    applyDrinkListBtn.addEventListener('click', applyDrinkList);

    // Validar al cambiar valores manualmente
    dishCountInput.addEventListener('change', function() {
        validateCount(dishCountInput, 1, 20);
    });

    drinkCountInput.addEventListener('change', function() {
        validateCount(drinkCountInput, 0, 10);
    });

    // --- INICIALIZACIÓN ---
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const todayLocal = new Date(today.getTime() - (offset * 60 * 1000));
    dateInput.value = todayLocal.toISOString().split('T')[0];

    updateDishInputs();
    updateDrinkInputs();
    loadHistoryFromStorage();
});