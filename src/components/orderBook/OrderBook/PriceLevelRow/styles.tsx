

interface ContainerProps {
  isRight: boolean;
  windowWidth: number;
}

export const Container = `
  display: flex;
  justify-content: space-around;
  background-color: #121723;
  position: relative;
  
  &:after {

    background-position: center;
    height: 100%;
    padding: .3em 0;
    display: block;
    content: "";
    position: absolute;
    left: 0;
    right: unset;
    z-index: 0;

  }
  
  span {
    z-index: 1;
    min-width: 54px;
  }
  
  .price {
    color: ${props => props.isRight ? '#118860' : '#bb3336'}
  }
`

export const PriceLevelRowContainer = styled.div`
  margin: .155em 0;
`