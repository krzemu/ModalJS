
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
        return this.renderedScreens.find(item => item.screen.getAttribute('data-name') === name)
    }

    changeScreen(name) {
        const { renderedScreens, visibleScreen } = this;
        const newScreen = this.findScreen(name);
        this.hideScreen(renderedScreens[visibleScreen].screen).then(() => {
            this.showScreen(newScreen.screen);
            this.visibleScreen = newScreen.screen.getAttribute('data-id');
        })
        newScreen.script(this);

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
                    modal.changeScreen('byeScreen')
                }, 5000)
            }
        },
        {
            name: 'byeScreen',
            html: `
                <h2>Bye</h2>
                <button>Click me!</button>
            `,
            script(modal) {
                this.screen.querySelector('button').addEventListener('click', () => {
                    modal.changeScreen('welcomeScreen');
                });
            },
        }
    ]
})

setTimeout(() => { popup.changeScreen('byeScreen') }, 2000);