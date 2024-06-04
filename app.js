
class Modal {
    constructor({ container = document.body, screens, timing = 300 }) {
        this.container = container;
        this.screens = [...screens];
        this.root = null;
        this.timing = timing;
        this.visibleScreen = null;
        this.renderedScreens = [];
        this.modalIsOpen = false;
        this.createRoot();
        this.renderScreens();
    }

    createScreen(screen, index) {
        const section = document.createElement('section');
        section.classList.add('screen')
        section.classList.add(screen.name);
        const inner = document.createElement('div');
        inner.classList.add("screen__inner");
        inner.innerHTML = screen.html;
        section.append(inner);
        section.setAttribute('data-name', screen.name);
        section.setAttribute('data-id', index);
        if (!screen.visible) {
            section.classList.add('screenHidden')
            section.style = 'display: none';
            return section;
        }
        this.welcomeScreen = { screen: section, script: this.screens[index].script }
        this.visibleScreen = index;
        return section;
    }

    createRoot() {
        const { container } = this;
        const modal = document.createElement('div');
        modal.classList.add('modal__root');
        modal.style = 'display:none';
        modal.classList.add('rootHidden');
        container.append(modal);
        this.root = modal;
    }
    renderScreens() {
        const { root, screens } = this;
        this.renderedScreens = [];
        screens.forEach((item, index) => {
            this.renderedScreens.push({ screen: this.createScreen(item, index), script: item.script });
            root.append(this.renderedScreens[index].screen);
        });
    }

    findScreen(name) {
        const newScreen = this.renderedScreens.find(item => item.screen.getAttribute('data-name') === name)
        return newScreen
    }

    // Can be used 

    openModal() {
        const { root, welcomeScreen } = this;
        if (!this.modalIsOpen) {

            root.style.display = 'block';
            setTimeout(() => {
                root.classList.add('rootVisible');
                root.classList.remove('rootHidden');
            }, 20);
            this.changeScreen(welcomeScreen.screen.getAttribute('data-name'));
            welcomeScreen.script(this, welcomeScreen.screen);
            this.modalIsOpen = true;
        }
    }

    closeModal() {
        const { root, timing } = this;
        root.classList.add('rootHidden');
        root.classList.remove('rootVisible');
        setTimeout(() => {
            root.style.display = 'none';
        }, timing);
        this.modalIsOpen = false;
    }

    hideScreen(screen) {
        const { timing } = this;
        return new Promise((res) => {
            screen.classList.add('screenHidden')
            screen.classList.remove('screenVisible')
            setTimeout(() => {
                screen.style.display = 'none';
                res();
            }, timing + 20)
        });
    }
    showScreen(screen) {
        return new Promise((res) => {
            screen.style.display = 'block';
            setTimeout(() => {
                screen.classList.add('screenVisible');
                screen.classList.remove('screenHidden');
                res();
            }, 10);
        });
    }

    changeScreen(name) {
        const { renderedScreens, visibleScreen } = this;
        const newScreen = this.findScreen(name);
        this.hideScreen(renderedScreens[visibleScreen].screen).then(() => {
            this.showScreen(newScreen.screen);
            this.visibleScreen = newScreen.screen.getAttribute('data-id');
        })
        newScreen.script(this, newScreen.screen);
    }
}

// Execute

const popup = new Modal({
    screens: [
        {
            name: 'welcomeScreen',
            html: `<h1>Hello world</h1>`,
            visible: true,
            script(modal) {
                setTimeout(() => {
                    modal.changeScreen('firstScreen')
                }, 5000)
            }
        },
        {
            name: 'firstScreen',
            html: `
            <h2>First screen</h2>
            <div class="actions">
                <button class="next">Next</button>
            </div>
            `,
            script(modal, section) {
                section.querySelector('.next').addEventListener('click', () => { modal.changeScreen('secondScreen') });
            }
        },
        {
            name: 'secondScreen',
            html: `
            <h2>Secon screen</h2>
            <div class="actions">
                <button class="prev">Pev</button>
                <button class="next">Next</button>
            </div>
            `,
            script(modal, section) {
                section.querySelector('.prev').addEventListener('click', () => { modal.changeScreen('firstScreen') });
                section.querySelector('.next').addEventListener('click', () => { modal.changeScreen('thirdScreen') });
            }
        }, {
            name: 'thirdScreen',
            html: `
            <h2>Third screen</h2>
            <div class="actions">
                    <button class="prev">Prev</button>
                    <button class="finish">Finish</button>
            </div>
            `,
            script(modal, section) {
                section.querySelector('.prev').addEventListener('click', () => { modal.changeScreen('secondScreen') });
                section.querySelector('.finish').addEventListener('click', () => { modal.changeScreen('byeScreen') });
            }
        },
        {
            name: 'byeScreen',
            html: `
                <h2>ByeBye</h2>
                <button>Click me!</button>
            `,
            script(modal, section) {
                section.querySelector('button').addEventListener('click', () => {
                    modal.closeModal();
                });
            },
        }
    ]
})
