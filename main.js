class MaterialWave extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.observer = new MutationObserver(this.handleSlotChange.bind(this));
    }

    connectedCallback() {
        this.render();
        const slot = this.shadowRoot.querySelector('slot');

        this.observer.observe(slot, {childList: true});
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    observedAttributes() {

    }

    attributeChangedCallback(prev, next) {

    }

    handleSlotChange() {
        const slot = this.shadowRoot.querySelector('slot');
        const elements = slot.assignedElements();

        // Поиск элемента с классом button-wrapper
        const buttonWrapper = elements.find(element => element.className === 'box');

        console.log(buttonWrapper);
        if (buttonWrapper) {
            // Навешиваем обработчики событий
            buttonWrapper.addEventListener('mousedown', this.onMouseDown);
            buttonWrapper.addEventListener('mouseup', this.onMouseUp);
        }
    }

    onMouseDown() {
        console.log('mouse down');
    }

    onMouseUp() {
        console.log('mouse up');
    }

    render() {
        this.shadowRoot.innerHTML = `
            <slot></slot>
        `;

        function rippleControl() {

            const increaseScaleToFillContainer = (scale = 1, ripple) => {
                if (!ripple) return;

                const container = ripple.parentNode?.getBoundingClientRect();

                if (!container) return;

                const rect = ripple.getBoundingClientRect();

                if (rect.width < container.width && rect.height < container.height) {
                    scale += 0.7;
                    ripple.style.transform = `scale(${scale})`;
                    window.requestAnimationFrame(() => increaseScaleToFillContainer(scale, ripple));
                }
            };

            return {
                updateRipplePosition: (ripple, {x, y}) => {
                    if (!ripple) return;

                    Object.assign(ripple.style, {
                        left: `${x - 50}px`,
                        top: `${y - 50}px`,
                    });
                },
                removeRipple: (ripple) => {

                    if (!ripple) return;
                    const step = (rippleItem) => {
                        let style = window.getComputedStyle(rippleItem);
                        let opacity = parseFloat(style.opacity).toFixed(1);

                        if (opacity > 0){
                            rippleItem.style.opacity = `${opacity - 0.5}`;
                            window.requestAnimationFrame(() => step(rippleItem));
                        } else {
                            rippleItem.remove();
                        }
                    };
                    window.requestAnimationFrame(() => step(ripple));
                },
                appendRipple: (target) => {

                    const ripple = document.createElement('div');

                    ripple.classList.add('wave-ripple');

                    Object.assign(ripple.style, {
                        position: 'absolute',
                        width: `${100}px`,
                        height: `${100}px`,
                        transform: 'scale(0)',
                        background: 'rgba(0, 0, 0, .2)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        opacity: '0',
                        transition: 'opacity .2s ease, transform 1s ease',
                    })

                    target.appendChild(ripple);
                    const step = () => {
                        let opacity = isNaN(parseFloat(ripple.style.opacity)) ? 0 : parseFloat(ripple.style.opacity);
                        if(opacity < 1){
                            ripple.style.opacity = `${opacity + 0.4}`;
                            window.requestAnimationFrame(step);
                        }
                    };
                    window.requestAnimationFrame(step);

                    return ripple;
                },
                increaseScaleToFillContainer,
            };
        }

        const control = rippleControl();
        const slot = this.shadowRoot
            .querySelector('slot');
        let ripples = []

        slot
            .addEventListener('mousedown', e => {
                const position = calculateCursorPosition(e, e.target);
                const ripple = control.appendRipple(e.target);
                ripples.push(ripple);
                control.updateRipplePosition(ripple, position);
                control.increaseScaleToFillContainer(0, ripple);
            });

        slot.addEventListener('mouseup', e => {
            ripples.map(control.removeRipple);
        })
    }
}

function calculateCursorPosition(mouseEvent, element) {
    const { clientX, clientY } = mouseEvent;
    const rect = element.getBoundingClientRect();

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}
customElements.define('material-wave', MaterialWave);
