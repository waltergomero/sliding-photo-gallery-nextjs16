import { appName, author, currentYear } from '@/helpers'
import { Col, Container, Row } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col md={6} className="text-center text-md-start">
            © 2025 - {currentYear} {appName}
          </Col>
          <Col md={6}>
            <div className="text-md-end d-none d-md-block">
              developed by <span className="fw-semibold">{author}</span>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer