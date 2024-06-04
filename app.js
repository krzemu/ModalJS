
class Modal {
    constructor({ container = document.body, screens }) {
        this.container = container;
        this.screens = [...screens];
        this.root = null;
        this.visibleScreen = null;
        this.renderedScreens = [];
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
        // Change logic, all screens should be hidden at the begining
        if (!screen.visible) {
            section.style = 'opacity:0; display: none';
            return section;
        }
        screen.script(this, section);
        this.visibleScreen = index;
        return section;
    }

    createRoot() {
        const { container } = this;
        const div = document.createElement('div');
        div.classList.add('modal__root');
        container.append(div);
        this.root = div;
    }
    renderScreens() {
        const { root, screens } = this;
        this.renderedScreens = [];
        screens.forEach((item, index) => {
            this.renderedScreens.push({ screen: this.createScreen(item, index), script: item.script });
            root.append(this.renderedScreens[index].screen);
        });
    }

    hideScreen(screen) {
        return new Promise((res) => {
            screen.style.opacity = 0;
            setTimeout(() => {
                screen.style.display = 'none';
                res();
            }, 320)
        });
    }
    showScreen(screen) {
        return new Promise((res) => {
            screen.style.display = 'block';
            setTimeout(() => {
                screen.style.opacity = 1;
                res();
            }, 10);
        });
    }

    findScreen(name) {
        const newScreen = this.renderedScreens.find(item => item.screen.getAttribute('data-name') === name)
        return newScreen
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
            script(modal, section, script) {
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
            script(modal, section, script) {
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
            script(modal, section, script) {
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
            script(modal, section, script) {
                section.querySelector('button').addEventListener('click', () => {
                    modal.changeScreen('welcomeScreen');
                });
            },
        }
    ]
})

// setTimeout(() => { popup.changeScreen('byeScreen') }, 2000);