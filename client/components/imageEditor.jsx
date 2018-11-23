import '../styles.scss';

const WIDTH = 180;

export default class ImageEditor extends React.Component {
    constructor(props) {
        super(props);

        const scale = this.boundScale(0, props);

        this.state = {
            imageX: this.boundX(0, scale, props),
            imageY: this.boundY(0, scale, props),
            dragging: false,
            lastMouseX: null,
            lastMouseY: null,
            lastImageX: null,
            lastImageY: null,
            scale: scale
        };

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
        this.setState(function (state, props) {
            if (!state.dragging) {
                return {};
            }
            return {
                imageX: this.boundX(state.lastImageX + e.screenX - state.lastMouseX, state.scale),
                imageY: this.boundY(state.lastImageY + e.screenY - state.lastMouseY, state.scale)
            };
        });
    }

    endDrag() {
        this.setState({
            lastMouseX: null,
            lastMouseY: null,
            lastImageX: null,
            lastImageY: null,
            dragging: false
        });
    }

    zoom(e) {
        this.props.onInteract();

        e.persist();

        this.setState(function (state, props) {
            const newScale = this.boundScale(state.scale * (1 - e.deltaY / 500));
            return {
                scale: newScale,
                imageX: this.boundX(state.imageX, newScale),
                imageY: this.boundY(state.imageY, newScale)};
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