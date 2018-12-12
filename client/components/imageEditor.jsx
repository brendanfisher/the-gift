const WIDTH = 180;

export default class ImageEditor extends React.Component {
    constructor(props) {
        super(props);

        const scale = this.boundScale(0, props);
        const X = this.boundX(0, scale, props);
        const Y = this.boundY(0, scale, props);

        this.state = {
            imageX: X,
            imageY: Y,
            dragging: false,
            lastMouseX: null,
            lastMouseY: null,
            lastImageX: null,
            lastImageY: null,
            scale: scale
        };

        this.props.passToParent({
            editZoom: scale,
            editX: X,
            editY: Y
        });

        this.dragBind = this.drag.bind(this);
        this.endDragBind = this.endDrag.bind(this);
    }

    componentDidMount() {
        window.addEventListener("mousemove", this.dragBind);
        window.addEventListener("mouseup", this.endDragBind);
    }

    componentWillUnmount() {
        window.removeEventListener("mousemove", this.dragBind);
        window.removeEventListener("mouseup", this.endDragBind);
    }

    startDrag(e) {
        if (this.props.disabled()) return;
        this.props.onInteract();

        e.persist();

        this.setState(function (state, props) {
            if (state.dragging) {
                return {};
            }
            return {
                lastImageX: state.imageX,
                lastImageY: state.imageY,
                lastMouseX: e.screenX,
                lastMouseY: e.screenY,
                dragging: true
            };
        });
    }

    drag(e) {
        if (this.props.disabled()) return;

        this.setState(function (state, props) {
            if (!state.dragging) {
                return {};
            }

            const newX = this.boundX(state.lastImageX + e.screenX - state.lastMouseX, state.scale);
            const newY = this.boundY(state.lastImageY + e.screenY - state.lastMouseY, state.scale);

            this.props.passToParent({
                editX: newX,
                editY: newY
            });

            return {
                imageX: newX,
                imageY: newY
            };
        });
    }

    endDrag() {
        if (this.props.disabled()) return;

        this.setState({
            lastMouseX: null,
            lastMouseY: null,
            lastImageX: null,
            lastImageY: null,
            dragging: false
        });
    }

    zoom(e) {
        if (this.props.disabled()) return;
        this.props.onInteract();

        e.persist();

        this.setState(function (state, props) {
            const newScale = this.boundScale(state.scale * (1 - e.deltaY / 500));
            const newX = this.boundX(state.imageX, newScale);
            const newY = this.boundY(state.imageY, newScale);

            this.props.passToParent({
                editZoom: newScale,
                editX: newX,
                editY: newY
            });

            return {
                scale: newScale,
                imageX: newX,
                imageY: newY
            };
        });
    }

    boundScale(n, props = this.props) {
        const photo = props.photo;
        const lowBound = Math.max(WIDTH / photo.width, WIDTH / photo.height);
        return Math.max(lowBound, Math.min(5, n));
    }

    boundX(n, scale, props = this.props) {
        const photo = props.photo;
        const highBound = (photo.width * scale - photo.width) / 2;
        const lowBound = WIDTH - highBound - photo.width;
        return Math.max(lowBound, Math.min(highBound, n));
    }

    boundY(n, scale, props = this.props) {
        const photo = props.photo;
        const highBound = (photo.height * scale - photo.height) / 2;
        const lowBound = WIDTH - highBound - photo.height;
        return Math.max(lowBound, Math.min(highBound, n));
    }

    render() {
        return (
            <div
                onMouseDown={this.startDrag.bind(this)}
                onWheel={this.zoom.bind(this)}
                className='image-preview'>
                <img src="../static/shadow.svg" className="shadow" draggable={false}/>
                <img
                    className='previewed-image'
                    style={{
                        transform: `translate(${this.state.imageX}px, ${this.state.imageY}px) scale(${this.state.scale})`
                    }}
                    draggable={false}
                    src={this.props.photo.src} />
            </div>
        );
    }
}